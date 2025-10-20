import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function IncomeExpenseChart({ data }) {
    const svgRef = useRef();

    useEffect(() => {
        if (!data || !data.summary) return;

        const { total_income, total_expenses } = data.summary;

        // Data for the chart
        const chartData = [
            { label: 'Income', value: total_income, color: '#10b981' },
            { label: 'Expenses', value: total_expenses, color: '#ef4444' },
        ];

        // Clear previous chart
        d3.select(svgRef.current).selectAll('*').remove();

        // Dimensions
        const width = 400;
        const height = 300;
        const margin = { top: 20, right: 20, bottom: 40, left: 60 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Create SVG
        const svg = d3
            .select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        const g = svg
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const x = d3
            .scaleBand()
            .domain(chartData.map((d) => d.label))
            .range([0, innerWidth])
            .padding(0.3);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(chartData, (d) => d.value)])
            .nice()
            .range([innerHeight, 0]);

        // X Axis
        g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('font-size', '12px')
            .style('font-weight', '500');

        // Y Axis
        g.append('g')
            .call(
                d3
                    .axisLeft(y)
                    .ticks(5)
                    .tickFormat((d) => `₹${(d / 1000).toFixed(0)}k`)
            )
            .selectAll('text')
            .style('font-size', '11px');

        // Bars
        g.selectAll('.bar')
            .data(chartData)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', (d) => x(d.label))
            .attr('width', x.bandwidth())
            .attr('y', innerHeight)
            .attr('height', 0)
            .attr('fill', (d) => d.color)
            .attr('rx', 4)
            .transition()
            .duration(800)
            .attr('y', (d) => y(d.value))
            .attr('height', (d) => innerHeight - y(d.value));

        // Value labels on top of bars
        g.selectAll('.label')
            .data(chartData)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', (d) => x(d.label) + x.bandwidth() / 2)
            .attr('y', (d) => y(d.value) - 5)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', (d) => d.color)
            .text((d) => `₹${(d.value / 1000).toFixed(1)}k`)
            .style('opacity', 0)
            .transition()
            .duration(800)
            .style('opacity', 1);

    }, [data]);

    return (
        <div className="flex justify-center">
            <svg ref={svgRef}></svg>
        </div>
    );
}