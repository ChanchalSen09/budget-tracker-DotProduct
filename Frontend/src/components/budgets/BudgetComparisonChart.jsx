import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function BudgetComparisonChart({ data }) {
    const svgRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return;

        // Clear previous chart
        d3.select(svgRef.current).selectAll('*').remove();

        // Prepare data for grouped bar chart
        const chartData = data.map((d) => ({
            category: d.category,
            allocated: d.allocated,
            spent: d.spent,
        }));

        // Dimensions
        const margin = { top: 20, right: 100, bottom: 60, left: 60 };
        const width = 700 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create SVG
        const svg = d3
            .select(svgRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        const g = svg
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const x0 = d3
            .scaleBand()
            .domain(chartData.map((d) => d.category))
            .rangeRound([0, width])
            .paddingInner(0.1);

        const x1 = d3
            .scaleBand()
            .domain(['allocated', 'spent'])
            .rangeRound([0, x0.bandwidth()])
            .padding(0.05);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(chartData, (d) => Math.max(d.allocated, d.spent))])
            .nice()
            .rangeRound([height, 0]);

        // Color scale
        const color = d3
            .scaleOrdinal()
            .domain(['allocated', 'spent'])
            .range(['#3b82f6', '#ef4444']);

        // X Axis
        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x0))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end')
            .style('font-size', '11px')
            .style('font-weight', '500');

        // Y Axis
        g.append('g')
            .attr('class', 'y-axis')
            .call(
                d3
                    .axisLeft(y)
                    .ticks(5)
                    .tickFormat((d) => `₹${(d / 1000).toFixed(0)}k`)
            )
            .selectAll('text')
            .style('font-size', '11px');

        // Add Y axis label
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -margin.left + 10)
            .attr('x', -height / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text('Amount (₹)');

        // Create groups for each category
        const categoryGroups = g
            .selectAll('.category-group')
            .data(chartData)
            .enter()
            .append('g')
            .attr('class', 'category-group')
            .attr('transform', (d) => `translate(${x0(d.category)},0)`);

        // Add bars for allocated
        categoryGroups
            .append('rect')
            .attr('x', x1('allocated'))
            .attr('y', height)
            .attr('width', x1.bandwidth())
            .attr('height', 0)
            .attr('fill', color('allocated'))
            .attr('rx', 3)
            .transition()
            .duration(800)
            .attr('y', (d) => y(d.allocated))
            .attr('height', (d) => height - y(d.allocated));

        // Add bars for spent
        categoryGroups
            .append('rect')
            .attr('x', x1('spent'))
            .attr('y', height)
            .attr('width', x1.bandwidth())
            .attr('height', 0)
            .attr('fill', color('spent'))
            .attr('rx', 3)
            .transition()
            .duration(800)
            .delay(200)
            .attr('y', (d) => y(d.spent))
            .attr('height', (d) => height - y(d.spent));

        // Add legend
        const legend = svg
            .append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${width + margin.left + 10}, ${margin.top})`);

        const legendItems = [
            { label: 'Allocated', color: color('allocated') },
            { label: 'Spent', color: color('spent') },
        ];

        legendItems.forEach((item, i) => {
            const legendRow = legend
                .append('g')
                .attr('transform', `translate(0, ${i * 25})`);

            legendRow
                .append('rect')
                .attr('width', 15)
                .attr('height', 15)
                .attr('fill', item.color)
                .attr('rx', 2);

            legendRow
                .append('text')
                .attr('x', 20)
                .attr('y', 12)
                .style('font-size', '12px')
                .style('font-weight', '500')
                .text(item.label);
        });

        // Add tooltips
        const tooltip = d3
            .select('body')
            .append('div')
            .attr('class', 'chart-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', '8px 12px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('z-index', '1000');

        categoryGroups.selectAll('rect')
            .on('mouseover', function (event, d) {
                const type = d3.select(this).attr('x') === x1('allocated').toString() ? 'allocated' : 'spent';
                const value = type === 'allocated' ? d.allocated : d.spent;

                d3.select(this).attr('opacity', 0.7);

                tooltip
                    .style('opacity', 1)
                    .html(`<strong>${d.category}</strong><br/>${type === 'allocated' ? 'Allocated' : 'Spent'}: ₹${value.toLocaleString('en-IN')}`)
                    .style('left', event.pageX + 10 + 'px')
                    .style('top', event.pageY - 10 + 'px');
            })
            .on('mouseout', function () {
                d3.select(this).attr('opacity', 1);
                tooltip.style('opacity', 0);
            });

        // Cleanup
        return () => {
            tooltip.remove();
        };
    }, [data]);

    return (
        <div className="flex justify-center overflow-x-auto">
            <svg ref={svgRef}></svg>
        </div>
    );
}