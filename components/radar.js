import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import csvtojson from 'csvtojson';

const RadarChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const convertCSVtoJSON = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/mmhuntsberry/d3-next-app/main/data/data.csv');
        const csvData = await response.text();
        const jsonArray = await csvtojson().fromString(csvData);

        const formattedData = jsonArray.map((item) => {
          return {
            ProgramNetwork: item['Program Network'],
            NumberofViewers: parseInt(item['Number of Viewers'])
          };
        });

        setData(formattedData);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    convertCSVtoJSON();
  }, []);

  const svgRef = useRef(null);
  const width = 500;
  const height = 500;
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (data.length > 0) {
      const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

      const categories = data.map((d) => d.ProgramNetwork);
      const numCategories = categories.length;

      const angleScale = d3.scaleLinear().domain([0, numCategories]).range([0, Math.PI * 2]);

      const radiusScale = d3.scaleLinear()
        .domain([0, d3.max(data, (d) => d.NumberofViewers)])
        .range([0, chartHeight / 2]);

      const lineGenerator = d3.lineRadial()
        .angle((d, i) => angleScale(i))
        .radius((d) => radiusScale(d.NumberofViewers))
        .curve(d3.curveLinearClosed);

      svg.selectAll('.radar-path').remove();

      svg.append('g')
        .attr('class', 'radar-group')
        .attr('transform', `translate(${margin.left + chartWidth / 2}, ${margin.top + chartHeight / 2})`)
        .selectAll('.radar-path')
        .data([data])
        .join('path')
        .attr('class', 'radar-path')
        .attr('d', lineGenerator)
        .attr('fill', 'steelblue')
        .attr('fill-opacity', 0.5)
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2);

      svg.selectAll('.radar-dot').remove();

      svg.append('g')
        .attr('class', 'radar-group')
        .attr('transform', `translate(${margin.left + chartWidth / 2}, ${margin.top + chartHeight / 2})`)
        .selectAll('.radar-dot')
        .data(data)
        .join('circle')
        .attr('class', 'radar-dot')
        .attr('cx', (d, i) => radiusScale(d.NumberofViewers) * Math.sin(angleScale(i)))
        .attr('cy', (d, i) => -radiusScale(d.NumberofViewers) * Math.cos(angleScale(i)))
        .attr('r', 5)
        .attr('fill', 'steelblue')
        .on('mouseover', (event, d) => {
          // Show tooltip
          const tooltip = d3.select('.tooltip');
          tooltip.style('visibility', 'visible');
          tooltip.html(`${d.ProgramNetwork}: ${d.NumberofViewers}`);
          tooltip.style('top', `${event.pageY - 10}px`);
          tooltip.style('left', `${event.pageX + 10}px`);
        })
        .on('mouseout', () => {
          // Hide tooltip
          const tooltip = d3.select('.tooltip');
          tooltip.style('visibility', 'hidden');
        });
    }
  }, [data, width, height, margin, chartWidth, chartHeight]);

  return (
    <div>
      <h1>Radar Chart</h1>
      <svg ref={svgRef}></svg>
      <div className="tooltip"></div>
    </div>
  );
};

export default RadarChart;
