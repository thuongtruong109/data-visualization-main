import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import csvtojson from 'csvtojson';

const PieChart = () => {
  const [data, setData] = useState([]);

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
  const width = 500;
  const height = 500;
  const radius = Math.min(width, height) / 2;

  useEffect(() => {
    if (data.length > 0) {
      const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

      const color = d3.scaleOrdinal(d3.schemeCategory10);

      const pie = d3.pie().value((d) => d.NumberofViewers).sort(null);

      const arc = d3.arc().innerRadius(0).outerRadius(radius);

      const arcLabel = d3.arc().innerRadius(radius * 0.8).outerRadius(radius * 0.8);

      const arcs = pie(data);

      const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

      g
        .selectAll('path')
        .data(arcs)
        .join('path')
        .attr('d', arc)
        .attr('fill', (d) => color(d.data.ProgramNetwork))
        .append('title')
        .text((d) => `${d.data.ProgramNetwork}: ${d.data.NumberofViewers}`);

      g
        .selectAll('text')
        .data(arcs)
        .join('text')
        .attr('transform', (d) => `translate(${arcLabel.centroid(d)})`)
        .attr('dy', '0.35em')

        .attr('dx', '-1.2em')
        .attr('font-size', '12px')
        .text((d) => `${d.data.ProgramNetwork}: ${d.data.NumberofViewers}`)
        .append('title');
    }
  }, [data, radius, width, height]);

  return (
    <div>
      <h1>Pie Chart</h1>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default PieChart;
