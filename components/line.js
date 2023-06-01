import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import csvtojson from 'csvtojson';

const LineChart = () => {
  const [data, setData] = useState([]);
  const [hoveredData, setHoveredData] = useState(null);

  useEffect(() => {
    const convertCSVtoJSON = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/mmhuntsberry/d3-next-app/main/data/data.csv');
        const csvData = await response.text();
        const jsonArray = await csvtojson().fromString(csvData);

        const formattedData = jsonArray.reduce((accumulator, item) => {
          const existingItem = accumulator.find((dataItem) => dataItem.ProgramNetwork === item['Program Network']);

          if (existingItem) {
            existingItem.NumberofViewers += parseInt(item['Number of Viewers']);
          } else {
            accumulator.push({
              ProgramNetwork: item['Program Network'],
              NumberofViewers: parseInt(item['Number of Viewers'])
            });
          }

          return accumulator;
        }, []);

        setData(formattedData);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    convertCSVtoJSON();
  }, []);

  const svgRef = useRef(null);
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = 500 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const x = d3.scaleBand().range([0, width]).padding(0.1);
  const y = d3.scaleLinear().range([height, 0]);

  useEffect(() => {
    if (data.length > 0) {
      const svg = d3.select(svgRef.current).attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);

      const xAxis = d3.axisBottom(x);
      const yAxis = d3.axisLeft(y);

      const line = d3.line().x((d) => x(d.ProgramNetwork)).y((d) => y(d.NumberofViewers));

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      x.domain(data.map((d) => d.ProgramNetwork));
      y.domain([0, d3.max(data, (d) => d.NumberofViewers)]);

      g.append('g').attr('class', 'x-axis').attr('transform', `translate(0, ${height})`).call(xAxis);

      g.append('g').attr('class', 'y-axis').call(yAxis);

      g.append('path').datum(data).attr('class', 'line').attr('d', line);

      g.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d) => x(d.ProgramNetwork))
        .attr('cy', (d) => y(d.NumberofViewers))
        .attr('r', 5)
        .on('mouseover', (event, d) => {
          setHoveredData(d);
        })
        .on('mouseout', () => {
          setHoveredData(null);
        });
    }
  }, [data, margin, width, height]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    svg.selectAll('.info-text').remove();

    if (hoveredData) {
      const g = svg.select('g');

      g.append('text')
        .attr('class', 'info-text')
        .attr('x', x(hoveredData.ProgramNetwork))
        .attr('y', y(hoveredData.NumberofViewers) - 10)
        .text(`${hoveredData.ProgramNetwork}: ${hoveredData.NumberofViewers}`);
    }
  }, [hoveredData, x, y]);

  return (
    <div>
      <h1>Line Chart</h1>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default LineChart;
