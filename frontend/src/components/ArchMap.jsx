import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const ArchMap = ({ data, onAskBob }) => {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Node colors by type
  const nodeColors = {
    frontend: '#3B82F6',
    backend: '#8B5CF6',
    database: '#10B981',
    config: '#F59E0B',
    test: '#6B7280',
    default: '#64748B',
  };

  useEffect(() => {
    // Handle responsive sizing
    const handleResize = () => {
      if (svgRef.current) {
        const container = svgRef.current.parentElement;
        setDimensions({
          width: container.clientWidth,
          height: Math.max(600, container.clientHeight),
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!data || !data.nodes || !data.edges || !svgRef.current) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);

    // Clear previous content
    svg.selectAll('*').remove();

    // Create main group for zoom/pan
    const g = svg.append('g');

    // Setup zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create arrow marker for directed edges
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 35)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#475569')
      .style('stroke', 'none');

    // Create force simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.edges)
        .id(d => d.id)
        .distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Create edges
    const link = g.append('g')
      .selectAll('line')
      .data(data.edges)
      .join('line')
      .attr('stroke', '#475569')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrowhead)');

    // Create edge labels (hidden by default, shown on hover)
    const edgeLabels = g.append('g')
      .selectAll('text')
      .data(data.edges)
      .join('text')
      .attr('class', 'edge-label')
      .attr('text-anchor', 'middle')
      .attr('fill', '#94A3B8')
      .attr('font-size', '11px')
      .attr('opacity', 0)
      .text(d => d.label || '');

    // Create node groups
    const node = g.append('g')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles for nodes
    node.append('circle')
      .attr('r', 28)
      .attr('fill', d => nodeColors[d.type] || nodeColors.default)
      .attr('stroke', '#1E293B')
      .attr('stroke-width', 3)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 32)
          .attr('stroke-width', 4);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 28)
          .attr('stroke-width', 3);
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
      });

    // Add node labels
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 45)
      .attr('fill', '#E2E8F0')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .text(d => d.label || d.id)
      .each(function(d) {
        const text = d3.select(this);
        const words = (d.label || d.id).split(/\s+/);
        if (words.length > 1) {
          text.text('');
          text.append('tspan')
            .attr('x', 0)
            .attr('dy', 0)
            .text(words[0]);
          text.append('tspan')
            .attr('x', 0)
            .attr('dy', 14)
            .text(words.slice(1).join(' '));
        }
      });

    // Add node type badges
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -35)
      .attr('fill', '#94A3B8')
      .attr('font-size', '9px')
      .attr('font-weight', '600')
      .attr('text-transform', 'uppercase')
      .text(d => d.type || 'module');

    // Tooltip for edge labels
    link.on('mouseover', function(event, d) {
      if (d.label) {
        const [x, y] = d3.pointer(event, svg.node());
        edgeLabels.filter(e => e === d)
          .attr('opacity', 1);
      }
    }).on('mouseout', function(event, d) {
      edgeLabels.filter(e => e === d)
        .attr('opacity', 0);
    });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      edgeLabels
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, dimensions]);

  const handleAskBob = () => {
    if (selectedNode && onAskBob) {
      onAskBob(`Tell me about the ${selectedNode.label || selectedNode.id} module`);
      setSelectedNode(null);
    }
  };

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-gray-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-lg">No architecture data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[600px]">
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4 z-10">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Module Types</h3>
        <div className="space-y-2">
          {Object.entries(nodeColors).filter(([key]) => key !== 'default').map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="text-xs text-gray-400 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 z-10">
        <div className="text-xs text-gray-400 space-y-1">
          <div>🖱️ Drag nodes to reposition</div>
          <div>🔍 Scroll to zoom</div>
          <div>👆 Click node for details</div>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="bg-[#0F172A] rounded-lg"
        style={{ cursor: 'grab' }}
      />

      {/* Selected Node Panel */}
      {selectedNode && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 z-10 min-w-[300px] shadow-2xl">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white">{selectedNode.label || selectedNode.id}</h3>
              <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full" 
                    style={{ 
                      backgroundColor: `${nodeColors[selectedNode.type] || nodeColors.default}20`,
                      color: nodeColors[selectedNode.type] || nodeColors.default
                    }}>
                {selectedNode.type || 'module'}
              </span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {selectedNode.description && (
            <p className="text-sm text-gray-400 mb-3">{selectedNode.description}</p>
          )}
          <button
            onClick={handleAskBob}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Ask AI about this module
          </button>
        </div>
      )}
    </div>
  );
};

export default ArchMap;

// Made with Bob
