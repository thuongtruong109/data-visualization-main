import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import csvtojson from 'csvtojson';

const ScatterChart = () => {
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
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (data.length > 0) {
      const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

      const x = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.NumberofViewers)])
        .range([margin.left, chartWidth]);

      const y = d3
        .scaleBand()
        .domain(data.map((d) => d.ProgramNetwork))
        .range([chartHeight, margin.top])
        .padding(0.1);

      svg.selectAll('.chart-circle').remove();

      svg
        .selectAll('.chart-circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'chart-circle')
        .attr('cx', (d) => x(d.NumberofViewers))
        .attr('cy', (d) => y(d.ProgramNetwork) + y.bandwidth() / 2)
        .attr('r', 5)
        .attr('fill', 'steelblue')
        .on('mouseover', (event, d) => {
          const { ProgramNetwork, NumberofViewers } = d;
          const tooltip = svg
            .append('text')
            .attr('class', 'chart-tooltip')
            .attr('x', x(NumberofViewers) + 10)
            .attr('y', y(ProgramNetwork) + y.bandwidth() / 2 - 10)
            .style('font-size', '12px')
            .style('fill', 'black')
            .text(`${ProgramNetwork}: ${NumberofViewers}`);

          tooltip
            .append('tspan')
            .attr('x', x(NumberofViewers) + 10)
            .attr('y', y(ProgramNetwork) + y.bandwidth() / 2 + 6)
            .style('font-size', '10px')
        })
        .on('mouseout', () => {
          svg.selectAll('.chart-tooltip').remove();
        });

      svg.selectAll('.chart-axis').remove();

      svg
        .append('g')
        .attr('class', 'chart-axis')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y));

      svg
        .append('g')
        .attr('class', 'chart-axis')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(x));
    }
  }, [data, width, height, margin, chartWidth, chartHeight]);

  return (
    <div>
      <h1>Scatter Chart</h1>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ScatterChart;
