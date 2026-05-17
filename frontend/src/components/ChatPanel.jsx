import { useState, useEffect, useRef } from 'react';
import { sendChat } from '../api/client';

const GOLD = '#C8920A';

function cleanMarkdown(text) {
  return text
    .replace(/\*{1,3}(.*?)\*{1,3}/g, '$1')
    .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const ChatPanel = ({ repoUrl, summary }) => {
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  const starterQuestions = [
    'Where should I start reading the code?',
    'What are the riskiest files?',
    'How do I add a new feature?',
    'What does the main entry point do?',
  ];

  useEffect(() => { setSessionId(crypto.randomUUID()); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (question = input) => {
    if (!question.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: question, timestamp: new Date().toISOString() }]);
    setInput('');
    setLoading(true);
    try {
      const res = await sendChat(repoUrl, question, sessionId);
      const raw = res.answer || res.response || 'I could not generate a response.';
      setMessages(prev => [...prev, { role: 'assistant', content: cleanMarkdown(raw), timestamp: new Date().toISOString() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}`, timestamp: new Date().toISOString(), isError: true }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#111111', border: '1px solid #2A2A2A', borderRadius: 16, overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid #1A1A1A', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#1A1A1A', border: '1px solid #2A2A2A',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>💬</div>
          <div>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>Chat with AI</h3>
            <p style={{ color: '#555', fontSize: 12, margin: 0 }}>Ask anything about this codebase</p>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 999,
          background: 'rgba(200,146,10,0.08)', border: '1px solid rgba(200,146,10,0.2)',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: GOLD }}>Powered by IBM Bob</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 18, minHeight: 0 }}>
        {messages.length === 0 && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Ask AI anything about this codebase</h3>
            <p style={{ color: '#555', fontSize: 13, maxWidth: 360, lineHeight: 1.65, marginBottom: 24 }}>
              The AI has analyzed the entire repository and can answer questions about architecture, code patterns, and more.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 380 }}>
              {starterQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  style={{
                    padding: '10px 16px', borderRadius: 10,
                    background: '#1A1A1A', border: '1px solid #2A2A2A',
                    color: '#A0A0A0', fontSize: 13, textAlign: 'left',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={e =>  { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.color = '#A0A0A0'; }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '78%' }}>
              {msg.role === 'assistant' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: '#1A1A1A', border: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>🤖</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: GOLD }}>AI Assistant</span>
                </div>
              )}
              <div style={{
                padding: '11px 15px',
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                background: msg.role === 'user' ? '#1A1A1A' : '#0F0F0F',
                border: msg.role === 'user'
                  ? `1px solid rgba(200,146,10,0.35)`
                  : `1px solid #1A1A1A`,
              }}>
                <p style={{
                  margin: 0, fontSize: 13.5, lineHeight: 1.75,
                  color: msg.isError ? '#f87171' : '#D0D0D0',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  {msg.content}
                </p>
              </div>
              <div style={{ fontSize: 11, color: '#333', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: '#1A1A1A', border: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>🤖</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: GOLD }}>AI Assistant</span>
              </div>
              <div style={{ padding: '12px 16px', borderRadius: '4px 14px 14px 14px', background: '#0F0F0F', border: '1px solid #1A1A1A', display: 'flex', alignItems: 'center', gap: 8 }}>
                {[0, 160, 320].map(d => (
                  <div key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: GOLD, animation: 'chatBounce 1.2s infinite', animationDelay: `${d}ms` }} />
                ))}
                <span style={{ fontSize: 13, color: '#555', marginLeft: 4 }}>Thinking…</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #1A1A1A', flexShrink: 0, background: '#0A0A0A' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about this codebase…"
            disabled={loading}
            style={{
              flex: 1, padding: '11px 16px', borderRadius: 999,
              background: '#111', border: '1px solid #2A2A2A',
              color: '#fff', fontSize: 14, outline: 'none',
              transition: 'border-color 0.2s',
              opacity: loading ? 0.5 : 1,
            }}
            onFocus={e => e.target.style.borderColor = GOLD}
            onBlur={e =>  e.target.style.borderColor = '#2A2A2A'}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="btn-primary"
            style={{ padding: '11px 22px', flexShrink: 0 }}
          >
            Send
          </button>
        </div>
      </div>

      <style>{`
        @keyframes chatBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50%       { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ChatPanel;
