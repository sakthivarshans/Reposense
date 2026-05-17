/**
 * ArchMap – Pure React + SVG architecture graph
 * Clicking a node's "Ask AI" button fetches an inline AI explanation
 * about how that module works, its config, and its tech stack.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { sendChat } from '../api/client';

/* ── Constants ──────────────────────────────────────────────────── */
const NODE_R = 28;
const NODE_COLORS = {
  frontend: '#C8920A',
  backend:  '#A67C00',
  database: '#2E7D52',
  config:   '#6B5B2E',
  test:     '#4A4A4A',
  default:  '#555555',
};

/* ── Normalise API data ──────────────────────────────────────────── */
function normalise(raw) {
  if (!raw) return null;
  const nodes = Array.isArray(raw.nodes) ? raw.nodes : [];
  const edges = Array.isArray(raw.edges) ? raw.edges
    : Array.isArray(raw.links) ? raw.links : [];
  if (!nodes.length) return null;
  return { nodes, edges };
}

/* ── Circular initial placement ─────────────────────────────────── */
function placeCircle(nodes, cx, cy, rx, ry) {
  return nodes.map((n, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
    return { ...n, x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle), vx: 0, vy: 0 };
  });
}

/* ── Spring-physics simulation step ─────────────────────────────── */
function simulate(nodes, edges) {
  const next = nodes.map(n => ({ ...n }));
  const REPEL = 6500;
  const SPRING_K = 0.04;
  const SPRING_LEN = 160;
  const DAMP = 0.85;

  for (let i = 0; i < next.length; i++) {
    for (let j = i + 1; j < next.length; j++) {
      const dx = next[j].x - next[i].x;
      const dy = next[j].y - next[i].y;
      const dist2 = dx * dx + dy * dy + 1;
      const len = Math.sqrt(dist2);
      const force = REPEL / dist2;
      next[i].vx -= (dx / len) * force;
      next[i].vy -= (dy / len) * force;
      next[j].vx += (dx / len) * force;
      next[j].vy += (dy / len) * force;
    }
  }

  const idxMap = Object.fromEntries(next.map((n, i) => [n.id, i]));
  for (const e of edges) {
    const si = idxMap[e.source] ?? idxMap[e.source?.id];
    const ti = idxMap[e.target] ?? idxMap[e.target?.id];
    if (si == null || ti == null) continue;
    const dx = next[ti].x - next[si].x;
    const dy = next[ti].y - next[si].y;
    const len = Math.sqrt(dx * dx + dy * dy) + 0.01;
    const force = SPRING_K * (len - SPRING_LEN);
    next[si].vx += (dx / len) * force;
    next[si].vy += (dy / len) * force;
    next[ti].vx -= (dx / len) * force;
    next[ti].vy -= (dy / len) * force;
  }

  for (const n of next) {
    if (n._pinned) { n.vx = 0; n.vy = 0; continue; }
    n.vx *= DAMP;
    n.vy *= DAMP;
    n.x += n.vx;
    n.y += n.vy;
  }
  return next;
}

/* ── Strip markdown / special chars from AI output ────────────────── */
/* Clean prose text – strips markdown but NOT code content */
function cleanText(raw) {
  return raw
    .replace(/\*{1,3}/g, '')          // remove * ** ***
    .replace(/_{1,2}/g, '')           // remove _ __
    .replace(/^#{1,6}\s*/gm, '')      // remove # ## headings
    .replace(/~~[^~]*~~/g, s => s.replace(/~~/g, ''))  // strikethrough
    .replace(/'/g, '')                // remove single quotes
    .replace(/[ \t]+$/gm, '')         // trim trailing spaces per line
    .replace(/\n{3,}/g, '\n\n')      // collapse excess blank lines
    .trim();
}

/* Split AI response into { explanation, code } at the CODE EXAMPLE marker */
function parseResponse(raw) {
  // The AI is asked to write CODE EXAMPLE: followed by the code block
  const MARKERS = ['CODE EXAMPLE:', 'CODE:', 'EXAMPLE CODE:', 'Example Code:', 'Code Example:'];
  for (const marker of MARKERS) {
    const idx = raw.indexOf(marker);
    if (idx !== -1) {
      const explanation = cleanText(raw.slice(0, idx));
      // Strip surrounding triple-backtick fences if present
      let code = raw.slice(idx + marker.length).trim();
      code = code.replace(/^```[\w]*\n?/, '').replace(/```\s*$/, '').trim();
      return { explanation, code };
    }
  }
  // Fallback: check for a fenced code block anywhere
  const fenceMatch = raw.match(/```[\w]*\n([\s\S]*?)```/);
  if (fenceMatch) {
    const explanation = cleanText(raw.slice(0, raw.indexOf('```')));
    const code        = fenceMatch[1].trim();
    return { explanation, code };
  }
  return { explanation: cleanText(raw), code: null };
}

/* ── NodeAIPanel – inline AI response drawer ────────────────────── */
function NodeAIPanel({ node, repoUrl, onClose }) {
  const [step,        setStep]        = useState('idle'); // idle | loading | done | error
  const [explanation, setExplanation] = useState('');
  const [code,        setCode]        = useState(null);   // null = no code block
  const [copied,      setCopied]      = useState(false);
  const sessionId = useRef(crypto.randomUUID());

  const ask = useCallback(async () => {
    if (step === 'loading') return;
    setStep('loading');
    setExplanation('');
    setCode(null);
    setCopied(false);

    const question =
      `Explain the "${node.label || node.id}" module in plain, clean prose. ` +
      `Do NOT use markdown, asterisks, bullet symbols, or single quotes. ` +
      `Write in numbered paragraphs only. Cover:\n` +
      `1. How it works and what it is responsible for.\n` +
      `2. How it is configured (environment variables, config files, options).\n` +
      `3. What programming languages and technologies are used to build it.\n\n` +
      `After the explanation, write exactly the label "CODE EXAMPLE:" on its own line, ` +
      `then provide a concise, real code snippet (10-25 lines) showing the actual configuration ` +
      `or core usage of this module from the repository. Use a proper code block.`;

    try {
      const res = await sendChat(repoUrl, question, sessionId.current);
      const raw = res.answer || res.response || 'No response received.';
      const parsed = parseResponse(raw);
      setExplanation(parsed.explanation);
      setCode(parsed.code);
      setStep('done');
    } catch (err) {
      setExplanation(`Error: ${err.message}`);
      setStep('error');
    }
  }, [node, repoUrl, step]);

  const handleCopy = useCallback(() => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  // Auto-ask on first mount
  useEffect(() => { ask(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const color = NODE_COLORS[node.type] || NODE_COLORS.default;

  return (
    <div
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
        background: 'rgba(10,15,30,0.98)',
        borderTop: `2px solid ${color}`,
        borderRadius: '12px 12px 8px 8px',
        maxHeight: '52%',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -12px 48px rgba(0,0,0,0.7)',
        animation: 'slideUp 0.25s ease-out',
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Drag handle + header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 18px 10px',
        borderBottom: '1px solid #1e293b',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Colored node indicator */}
          <div style={{
            width: 10, height: 10, borderRadius: '50%', background: color,
            boxShadow: `0 0 8px ${color}80`,
          }} />
          <div>
            <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14 }}>
              {node.label || node.id}
            </span>
            <span style={{
              marginLeft: 8, fontSize: 11, fontWeight: 600,
              padding: '2px 7px', borderRadius: 4,
              background: `${color}25`, color,
            }}>
              {node.type || 'module'}
            </span>
          </div>
          {/* Groq badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '2px 8px', borderRadius: 20,
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
            marginLeft: 4,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: '#3b82f6',
              animation: step === 'loading' ? 'pulse 1s infinite' : 'none',
            }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#60a5fa' }}>Powered by Groq</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {step === 'done' || step === 'error' ? (
            <button
              onClick={ask}
              style={{
                padding: '4px 12px', borderRadius: 6, border: '1px solid #334155',
                background: 'transparent', color: '#64748b', fontSize: 12,
                cursor: 'pointer',
              }}
            >↺ Ask again</button>
          ) : null}
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 20, lineHeight: 1, padding: '0 4px' }}
            aria-label="Close"
          >×</button>
        </div>
      </div>

      {/* Question shown */}
      <div style={{ padding: '10px 18px 0', flexShrink: 0 }}>
        <div style={{
          background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
          borderRadius: 8, padding: '8px 12px',
        }}>
          <p style={{ fontSize: 12, color: '#60a5fa', margin: 0, lineHeight: 1.5 }}>
            💬 How does <strong>{node.label || node.id}</strong> work? How is it configured? What languages are used?
          </p>
        </div>
      </div>

      {/* Response area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px 16px' }}>
        {step === 'loading' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', paddingTop: 8 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 150, 300].map(d => (
                <div key={d} style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#3b82f6',
                  animation: 'bounce 1s infinite', animationDelay: `${d}ms`,
                }} />
              ))}
            </div>
            <span style={{ fontSize: 13 }}>AI is analysing this module…</span>
          </div>
        )}

        {(step === 'done' || step === 'error') && (
          <div>
            {/* ── Explanation prose ── */}
            <div style={{ fontSize: 13.5, lineHeight: 1.85, marginBottom: code ? 20 : 0 }}>
              {explanation.split('\n').map((line, i) => {
                const isSection = /^\d+\.\s/.test(line.trim());
                const isEmpty   = line.trim() === '';
                if (isEmpty) return <div key={i} style={{ height: 8 }} />;
                return (
                  <p key={i} style={{
                    margin: isSection ? '14px 0 4px' : '0 0 3px',
                    fontWeight: isSection ? 700 : 400,
                    fontSize:   isSection ? 14 : 13.5,
                    color:      isSection
                      ? (step === 'error' ? '#f87171' : '#e2e8f0')
                      : (step === 'error' ? '#f87171' : '#94a3b8'),
                    letterSpacing: isSection ? '0.01em' : 0,
                  }}>
                    {line}
                  </p>
                );
              })}
            </div>

            {/* ── Code block ── */}
            {code && (
              <div style={{ marginTop: 4 }}>
                {/* Code block header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#0d1117', borderRadius: '8px 8px 0 0',
                  padding: '8px 14px',
                  border: '1px solid #21262d',
                  borderBottom: 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {['#ff5f57','#febc2e','#28c840'].map(c => (
                        <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: '#6e7681', fontFamily: 'monospace' }}>Configuration Example</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    style={{
                      background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : '#30363d'}`,
                      borderRadius: 5, cursor: 'pointer',
                      padding: '3px 10px', fontSize: 11,
                      color: copied ? '#4ade80' : '#8b949e',
                      transition: 'all 0.2s',
                    }}
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                {/* Code content */}
                <pre style={{
                  margin: 0,
                  background: '#0d1117',
                  border: '1px solid #21262d',
                  borderRadius: '0 0 8px 8px',
                  padding: '14px 16px',
                  overflowX: 'auto',
                  fontSize: 12.5,
                  lineHeight: 1.65,
                  color: '#e6edf3',
                  fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace',
                  whiteSpace: 'pre',
                  tabSize: 2,
                }}>
                  <code>{code}</code>
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

/* ── Main ArchMap component ──────────────────────────────────────── */
export default function ArchMap({ data, repoUrl }) {
  const wrapperRef  = useRef(null);
  const rafRef      = useRef(null);
  const stateRef    = useRef(null);

  const [size,         setSize]         = useState({ w: 900, h: 580 });
  const [positions,    setPositions]    = useState([]);
  const [selectedNode, setSelectedNode] = useState(null); // node clicked
  const [aiPanelNode,  setAiPanelNode]  = useState(null); // node whose AI panel is open
  const [dragging,     setDragging]     = useState(null);
  const [pan,          setPan]          = useState({ x: 0, y: 0 });
  const [zoom,         setZoom]         = useState(1);
  const panRef    = useRef({ x: 0, y: 0 });
  const zoomRef   = useRef(1);
  const isPanning = useRef(false);
  const panStart  = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const norm = normalise(data);

  /* ── Measure container ──────────────────────────────────────────── */
  useEffect(() => {
    if (!wrapperRef.current) return;
    const measure = () => {
      const el = wrapperRef.current;
      if (!el) return;
      setSize({ w: el.offsetWidth || 900, h: el.offsetHeight || 580 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  /* ── Init physics on data/size change ───────────────────────────── */
  useEffect(() => {
    if (!norm) return;
    const placed = placeCircle(norm.nodes, size.w / 2, size.h / 2, size.w * 0.32, size.h * 0.32);
    stateRef.current = placed;
    setPositions(placed);
    setSelectedNode(null);
    setAiPanelNode(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, size.w, size.h]);

  /* ── Simulation loop ────────────────────────────────────────────── */
  useEffect(() => {
    if (!norm || !stateRef.current) return;
    let ticks = 0;
    const MAX = 300;
    const loop = () => {
      ticks++;
      stateRef.current = simulate(stateRef.current, norm.edges);
      setPositions([...stateRef.current]);
      if (ticks < MAX) rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, size.w, size.h]);

  /* ── Interaction handlers ───────────────────────────────────────── */
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    zoomRef.current = Math.min(4, Math.max(0.2, zoomRef.current * delta));
    setZoom(zoomRef.current);
  }, []);

  const onMouseDownBg = useCallback((e) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY, px: panRef.current.x, py: panRef.current.y };
  }, []);

  const onMouseMove = useCallback((e) => {
    if (dragging) {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      const wx = (e.clientX - rect.left  - panRef.current.x) / zoomRef.current;
      const wy = (e.clientY - rect.top   - panRef.current.y) / zoomRef.current;
      stateRef.current = stateRef.current.map(n =>
        n.id === dragging ? { ...n, x: wx, y: wy, vx: 0, vy: 0, _pinned: true } : n
      );
      setPositions([...stateRef.current]);
    } else if (isPanning.current) {
      panRef.current = {
        x: panStart.current.px + (e.clientX - panStart.current.x),
        y: panStart.current.py + (e.clientY - panStart.current.y),
      };
      setPan({ ...panRef.current });
    }
  }, [dragging]);

  const onMouseUp = useCallback(() => {
    isPanning.current = false;
    if (dragging) {
      stateRef.current = stateRef.current.map(n =>
        n.id === dragging ? { ...n, _pinned: false } : n
      );
      setDragging(null);
    }
  }, [dragging]);

  const onNodeMouseDown = useCallback((e, nodeId) => {
    e.stopPropagation();
    setDragging(nodeId);
  }, []);

  const onNodeClick = useCallback((e, node) => {
    e.stopPropagation();
    setSelectedNode(prev => prev?.id === node.id ? null : { ...node });
    setAiPanelNode(null); // close AI panel if switching nodes
  }, []);

  /* ── Empty state ─────────────────────────────────────────────────── */
  if (!norm) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center', color: '#475569' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🗺️</div>
          <p style={{ color: '#94a3b8', fontSize: 16 }}>No architecture data available</p>
          <p style={{ color: '#475569', fontSize: 13, marginTop: 4 }}>Re-run the analysis to generate the map</p>
        </div>
      </div>
    );
  }

  const posMap = Object.fromEntries(positions.map(p => [p.id, p]));

  return (
    <div style={{ position: 'relative', width: '100%', height: '70vh', minHeight: 580 }}>

      {/* ── Legend ─────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 12, left: 12, zIndex: 10,
        background: 'rgba(17,17,17,0.95)', border: '1px solid #2A2A2A',
        borderRadius: 10, padding: '12px 16px', pointerEvents: 'none',
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#555', margin: '0 0 8px', textTransform: 'uppercase' }}>Module Types</p>
        {Object.entries(NODE_COLORS).filter(([k]) => k !== 'default').map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 12, color: '#A0A0A0', textTransform: 'capitalize' }}>{type}</span>
          </div>
        ))}
      </div>

      {/* ── Controls hint ───────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 12, right: 12, zIndex: 10,
        background: 'rgba(17,17,17,0.95)', border: '1px solid #2A2A2A',
        borderRadius: 10, padding: '10px 14px', pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 12, color: '#555', lineHeight: 1.9 }}>
          <div>🖱️ Drag nodes • drag bg to pan</div>
          <div>🔍 Scroll to zoom</div>
          <div>👆 Click node → Ask AI</div>
        </div>
      </div>

      {/* ── Stats badge ─────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: aiPanelNode ? '53%' : 12, left: 12, zIndex: 10,
        background: 'rgba(17,17,17,0.95)', border: '1px solid #2A2A2A',
        borderRadius: 8, padding: '5px 12px', pointerEvents: 'none',
        transition: 'bottom 0.25s',
      }}>
        <span style={{ fontSize: 12, color: '#555' }}>
          {norm.nodes.length} modules · {norm.edges.length} connections
        </span>
      </div>

      {/* ── SVG Canvas ──────────────────────────────────────────────── */}
      <div
        ref={wrapperRef}
        style={{
          width: '100%', height: '100%',
          background: '#0F172A', borderRadius: 8, overflow: 'hidden',
          cursor: dragging ? 'grabbing' : 'grab', position: 'relative',
        }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
        onMouseDown={onMouseDownBg}
        onClick={() => { setSelectedNode(null); }}
      >
        <svg
          width={size.w}
          height={size.h}
          style={{ display: 'block', userSelect: 'none' }}
        >
          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>

            {/* Edges */}
            <defs>
              <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#334155" />
              </marker>
            </defs>
            <g>
              {norm.edges.map((e, i) => {
                const srcId = typeof e.source === 'object' ? e.source?.id : e.source;
                const tgtId = typeof e.target === 'object' ? e.target?.id : e.target;
                const s = posMap[srcId];
                const t = posMap[tgtId];
                if (!s || !t) return null;
                const dx = t.x - s.x, dy = t.y - s.y;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const ex = t.x - (dx / len) * (NODE_R + 5);
                const ey = t.y - (dy / len) * (NODE_R + 5);
                return (
                  <g key={i}>
                    <line
                      x1={s.x} y1={s.y} x2={ex} y2={ey}
                      stroke="#334155" strokeWidth={1.5} strokeOpacity={0.8}
                      markerEnd="url(#arrow)"
                    />
                    {e.label && (
                      <text
                        x={(s.x + ex) / 2} y={(s.y + ey) / 2 - 5}
                        textAnchor="middle" fill="#475569" fontSize={9}
                      >{e.label}</text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Nodes */}
            <g>
              {positions.map((node) => {
                const color      = NODE_COLORS[node.type] || NODE_COLORS.default;
                const isSelected = selectedNode?.id === node.id;
                const hasAI      = aiPanelNode?.id === node.id;
                const label      = node.label || node.id || '';
                const shortLabel = label.length > 14 ? label.slice(0, 13) + '…' : label;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x},${node.y})`}
                    style={{ cursor: 'pointer' }}
                    onMouseDown={e => onNodeMouseDown(e, node.id)}
                    onClick={e => onNodeClick(e, node)}
                  >
                    {/* Pulse ring for selected/AI-open node */}
                    {(isSelected || hasAI) && (
                      <circle r={NODE_R + 10} fill="none" stroke={color} strokeWidth={1.5} opacity={0.35} />
                    )}
                    {/* Main circle */}
                    <circle
                      r={NODE_R}
                      fill={color}
                      stroke={isSelected || hasAI ? '#fff' : '#0F172A'}
                      strokeWidth={isSelected || hasAI ? 3 : 2}
                    />
                    {/* Type badge above */}
                    <text textAnchor="middle" dy={-NODE_R - 8} fill="#64748b" fontSize={8} fontWeight={700}>
                      {(node.type || 'module').toUpperCase()}
                    </text>
                    {/* Name below */}
                    <text textAnchor="middle" dy={NODE_R + 16} fill="#cbd5e1" fontSize={11} fontWeight={500}>
                      {shortLabel}
                    </text>
                    {/* ✨ "Ask AI" inline button shown when node is selected */}
                    {isSelected && !hasAI && (
                      <g
                        onClick={e => {
                          e.stopPropagation();
                          setAiPanelNode({ ...node });
                          setSelectedNode(null);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Button background pill */}
                        <rect
                          x={-36} y={NODE_R + 22}
                          width={72} height={20}
                          rx={10}
                          fill={color}
                          opacity={0.9}
                        />
                        <text
                          textAnchor="middle"
                          dy={NODE_R + 36}
                          fill="#fff"
                          fontSize={10}
                          fontWeight={700}
                        >💬 Ask AI</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        {/* ── Inline AI Panel (slides up from bottom) ─────────────── */}
        {aiPanelNode && repoUrl && (
          <NodeAIPanel
            key={aiPanelNode.id}
            node={aiPanelNode}
            repoUrl={repoUrl}
            onClose={() => setAiPanelNode(null)}
          />
        )}
        {aiPanelNode && !repoUrl && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
            background: '#0f172a', borderTop: '1px solid #334155',
            padding: 16, textAlign: 'center', color: '#64748b', fontSize: 13,
          }}>
            Repository URL not available. Please re-analyze the repository.
          </div>
        )}
      </div>
    </div>
  );
}
