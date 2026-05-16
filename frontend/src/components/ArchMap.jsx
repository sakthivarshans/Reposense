import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function ArchMap({ architecture }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!architecture || architecture.length === 0) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Get container dimensions
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 600;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Create a group for zoom
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create hierarchy from data
    const root = d3.hierarchy(architecture[0]);

    // Create tree layout
    const treeLayout = d3.tree()
      .size([height - 100, width - 200])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2));

    // Generate tree
    treeLayout(root);

    // Create links
    g.selectAll('.link')
      .data(root.links())
      .join('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x(d => d.y + 100)
        .y(d => d.x + 50))
      .attr('fill', 'none')
      .attr('stroke', '#4a5568')
      .attr('stroke-width', 2)
      .attr('opacity', 0.6);

    // Create nodes
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y + 100},${d.x + 50})`);

    // Add circles for nodes
    nodes.append('circle')
      .attr('r', 6)
      .attr('fill', d => {
        if (d.data.type === 'directory') return '#4299e1';
        if (d.data.type === 'file') return '#48bb78';
        return '#ed8936';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 6);
      });

    // Add labels
    nodes.append('text')
      .attr('dy', -12)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e8f0')
      .attr('font-size', '12px')
      .text(d => d.data.name)
      .style('pointer-events', 'none');

    // Add type labels
    nodes.append('text')
      .attr('dy', 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#a0aec0')
      .attr('font-size', '10px')
      .text(d => d.data.type)
      .style('pointer-events', 'none');

  }, [architecture]);

  if (!architecture || architecture.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-400">No architecture data available</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Architecture Map</h3>
        <p className="text-sm text-gray-400">
          Interactive visualization of repository structure. Scroll to zoom, drag to pan.
        </p>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 overflow-hidden">
        <svg ref={svgRef} className="w-full"></svg>
      </div>
      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-400">Directory</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-400">File</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-gray-400">Module</span>
        </div>
      </div>
    </div>
  );
}

export default ArchMap;

// Made with Bob
