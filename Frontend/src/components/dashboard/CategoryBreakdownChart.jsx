import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function CategoryBreakdownChart({ data }) {
    const svgRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return;

        // Filter only expense categories and get top 5
        const expenseData = data
            .filter((d) => d.type === 'EXPENSE')
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        if (expenseData.length === 0) return;

        // Clear previous chart
        d3.select(svgRef.current).selectAll('*').remove();

        // Dimensions
        const width = 400;
        const height = 300;
        const radius = Math.min(width, height) / 2 - 40;

        // Color scale
        const color = d3.scaleOrdinal()
            .domain(expenseData.map(d => d.category__name))
            .range(['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']);

        // Create SVG
        const svg = d3
            .select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        const g = svg
            .append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        // Pie generator
        const pie = d3
            .pie()
            .value((d) => d.total)
            .sort(null);

        // Arc generator
        const arc = d3
            .arc()
            .innerRadius(radius * 0.5)
            .outerRadius(radius);

        const arcHover = d3
            .arc()
            .innerRadius(radius * 0.5)
            .outerRadius(radius + 10);

        // Create arcs
        const arcs = g
            .selectAll('.arc')
            .data(pie(expenseData))
            .enter()
            .append('g')
            .attr('class', 'arc');

        // Add paths
        arcs
            .append('path')
            .attr('d', arc)
            .attr('fill', (d) => color(d.data.category__name))
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('d', arcHover);

                // Show tooltip
                tooltip
                    .style('opacity', 1)
                    .html(
                        `<strong>${d.data.category__name}</strong><br/>` +
                        `₹${d.data.total.toLocaleString('en-IN')}<br/>` +
                        `<span style="color: #93c5fd">${((d.data.total / d3.sum(expenseData, (d) => d.total)) * 100).toFixed(1)}%</span>`
                    )
                    .style('left', event.pageX + 15 + 'px')
                    .style('top', event.pageY - 15 + 'px');
            })
            .on('mouseout', function () {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('d', arc);

                tooltip.style('opacity', 0);
            })
            .transition()
            .duration(800)
            .attrTween('d', function (d) {
                const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                return function (t) {
                    return arc(interpolate(t));
                };
            });

        // Add percentage labels
        arcs
            .append('text')
            .attr('transform', (d) => `translate(${arc.centroid(d)})`)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', 'white')
            .style('opacity', 0)
            .text((d) => {
                const percentage = (d.data.total / d3.sum(expenseData, (d) => d.total)) * 100;
                return percentage > 5 ? `${percentage.toFixed(0)}%` : '';
            })
            .transition()
            .delay(800)
            .duration(400)
            .style('opacity', 1);

        // Create tooltip
        const tooltip = d3
            .select('body')
            .append('div')
            .attr('class', 'pie-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.85)')
            .style('color', 'white')
            .style('padding', '10px 14px')
            .style('border-radius', '6px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('z-index', '1000')
            .style('box-shadow', '0 4px 6px rgba(0,0,0,0.1)');

        // Cleanup
        return () => {
            tooltip.remove();
        };
    }, [data]);

    return (
        <div className="flex justify-center py-4">
            <svg ref={svgRef}></svg>
        </div>
    );
}