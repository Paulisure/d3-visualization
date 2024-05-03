document.addEventListener('DOMContentLoaded', async function() {
  const data = await d3.csv("heart_failure_clinical_records_dataset.csv");

  const size = 150;
  const padding = 30; // Increased to give space for labels
  const variables = ['age', 'serum_creatinine', 'ejection_fraction', 'high_blood_pressure', 'anaemia']; // Example set
  const svg = d3.select("#scatterplot_matrix").append("svg")
    .attr("width", size * variables.length + padding)
    .attr("height", size * variables.length + padding)
    .style("font", "10px sans-serif");

  const xScale = {}, yScale = {};
  variables.forEach(variable => {
    const domain = d3.extent(data, d => +d[variable]);
    xScale[variable] = d3.scaleLinear().domain(domain).range([padding / 2, size - padding / 2]);
    yScale[variable] = d3.scaleLinear().domain(domain).range([size - padding / 2, padding / 2]);
  });

  svg.selectAll(".x.axis")
    .data(variables)
    .enter().append("g")
    .attr("class", "x axis")
    .attr("transform", (d, i) => `translate(${i * size + padding}, ${size * variables.length})`)
    .each(function(d) { d3.select(this).call(d3.axisBottom(xScale[d]).ticks(6)); })
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -6)
    .attr("x", size / 2)
    .attr("dy", "2.1em")
    .text(d => d);

  svg.selectAll(".y.axis")
    .data(variables)
    .enter().append("g")
    .attr("class", "y axis")
    .attr("transform", (d, i) => `translate(0, ${i * size})`)
    .each(function(d) { d3.select(this).call(d3.axisLeft(yScale[d]).ticks(6)); })
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", size / 2)
    .attr("x", -padding)
    .attr("dy", "-1.5em")
    .attr("transform", "rotate(-90)")
    .text(d => d);

  const brush = d3.brush()
    .extent([[0, 0], [size, size]])
    .on("start brush", brushed)
    .on("end", brushended);

  let selected = [];

  const cell = svg.selectAll(".cell")
    .data(d3.cross(variables, variables))
    .enter().append("g")
    .attr("class", "cell")
    .attr("transform", ([x, y]) => `translate(${variables.indexOf(x) * size}, ${variables.indexOf(y) * size})`)
    .each(plot);

  cell.call(brush);

  function plot([x, y]) {
    d3.select(this).selectAll("circle")
      .data(data)
      .enter().append("circle")
      .attr("cx", d => xScale[x](+d[x]))
      .attr("cy", d => yScale[y](+d[y]))
      .attr("r", 4)
      .style("fill", d => selected.includes(d) ? "red" : "steelblue");
  }

  function brushed(event) {
    if (event.selection) {
      const [[x0, y0], [x1, y1]] = event.selection;
      selected = data.filter(d => {
        return xScale[x](+d[x]) >= x0 && xScale[x](+d[x]) <= x1 &&
               yScale[y](+d[y]) >= y0 && yScale[y](+d[y]) <= y1;
      });
    } else {
      selected = [];
    }
    svg.selectAll("circle").style("fill", d => selected.includes(d) ? "red" : "steelblue");
  }

  function brushended() {
    if (!d3.event.selection) svg.selectAll("circle").style("fill", "steelblue");
  }
});
