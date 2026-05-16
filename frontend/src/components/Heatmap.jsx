import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function Heatmap({ data }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Get container dimensions
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 100, left: 200 };

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Prepare data - take top 20 files
    const topFiles = data.slice(0, 20);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(topFiles, d => d.activity_score) || 100])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleBand()
      .domain(topFiles.map(d => d.file_path))
      .range([margin.top, height - margin.bottom])
      .padding(0.1);

    // Color scale
    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(topFiles, d => d.activity_score) || 100])
      .interpolator(d3.interpolateRgb('#1a202c', '#f56565'));

    // Create bars
    svg.selectAll('.bar')
      .data(topFiles)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', margin.left)
      .attr('y', d => yScale(d.file_path))
      .attr('width', d => xScale(d.activity_score) - margin.left)
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.activity_score))
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8);

        // Show tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${event.offsetX}, ${event.offsetY - 10})`);

        tooltip.append('rect')
          .attr('fill', '#1a202c')
          .attr('stroke', '#4a5568')
          .attr('rx', 4)
          .attr('width', 200)
          .attr('height', 60)
          .attr('x', -100)
          .attr('y', -60);

        tooltip.append('text')
          .attr('fill', '#e2e8f0')
          .attr('text-anchor', 'middle')
          .attr('y', -40)
          .attr('font-size', '12px')
          .text(`Activity: ${d.activity_score.toFixed(1)}`);

        tooltip.append('text')
          .attr('fill', '#a0aec0')
          .attr('text-anchor', 'middle')
          .attr('y', -25)
          .attr('font-size', '10px')
          .text(`Commits: ${d.commit_count}`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);

        svg.selectAll('.tooltip').remove();
      });

    // Add file path labels
    svg.selectAll('.label')
      .data(topFiles)
      .join('text')
      .attr('class', 'label')
      .attr('x', margin.left - 10)
      .attr('y', d => yScale(d.file_path) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#e2e8f0')
      .attr('font-size', '11px')
      .text(d => {
        const parts = d.file_path.split('/');
        return parts[parts.length - 1];
      })
      .style('pointer-events', 'none');

    // Add x-axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => d.toFixed(0));

    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .attr('color', '#a0aec0');

    // Add x-axis label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - margin.bottom + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e8f0')
      .attr('font-size', '12px')
      .text('Activity Score');

  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-400">No heatmap data available</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Activity Heatmap</h3>
        <p className="text-sm text-gray-400">
          Top 20 most active files by commit frequency and complexity
        </p>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 overflow-hidden">
        <svg ref={svgRef} className="w-full"></svg>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="w-12 h-3 rounded" style={{ background: 'linear-gradient(to right, #1a202c, #f56565)' }}></div>
          <span className="text-gray-400">Low → High Activity</span>
        </div>
        <span className="text-gray-500">Hover over bars for details</span>
      </div>
    </div>
  );
}

export default Heatmap;

// Made with Bob
