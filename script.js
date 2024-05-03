document.addEventListener('DOMContentLoaded', async function() {
  const data = await d3.csv("heart_failure_clinical_records_dataset.csv");

  // Dimensions for each individual plot
  const size = 150;
  const padding = 20;
  const variables = ['age', 'serum_creatinine', 'ejection_fraction', 'high_blood_pressure', 'anaemia'];

  const svg = d3.select("#scatterplot_matrix").append("svg")
    .attr("width", size * variables.length + padding)
    .attr("height", size * variables.length + padding)
    .style("font", "10px sans-serif");

  const xScale = {}, yScale = {};
  variables.forEach(variable => {
    const value = d => +d[variable];
    const domain = d3.extent(data, value);
    xScale[variable] = d3.scaleLinear(domain, [padding / 2, size - padding / 2]);
    yScale[variable] = d3.scaleLinear(domain, [size - padding / 2, padding / 2]);
  });

  const xAxis = d3.axisBottom()
    .ticks(6)
    .tickSize(size * variables.length);

  const yAxis = d3.axisLeft()
    .ticks(6)
    .tickSize(-size * variables.length);

  svg.selectAll(".x.axis")
    .data(variables)
    .join("g")
    .attr("class", "x axis")
    .attr("transform", (d, i) => `translate(${i * size},0)`)
    .each(function(d) { d3.select(this).call(xAxis.scale(xScale[d])); });

  svg.selectAll(".y.axis")
    .data(variables)
    .join("g")
    .attr("class", "y axis")
    .attr("transform", (d, i) => `translate(0,${i * size})`)
    .each(function(d) { d3.select(this).call(yAxis.scale(yScale[d])); });

  // Create scatter plots
  const cell = svg.selectAll("g.cell")
    .data(d3.cross(variables, variables))
    .join("g")
    .attr("class", "cell")
    .attr("transform", ([i, j]) => `translate(${i * size},${j * size})`);

  cell.each(function([i, j]) {
    d3.select(this).selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => xScale[i](d[i]))
      .attr("cy", d => yScale[j](d[j]))
      .attr("r", 3)
      .attr("fill", d => d.DEATH_EVENT ? "red" : "green");
  });

  // Add brushing functionality
  const brush = d3.brush()
    .extent([[padding / 2, padding / 2], [size - padding / 2, size - padding / 2]])
    .on("start", brushstarted)
    .on("brush", brushed);

  cell.call(brush);

  let brushCell;

  // Clear the previously-active brush, if any.
  function brushstarted() {
    if (brushCell !== this) {
      d3.select(brushCell).call(brush.move, null);
      brushCell = this;
    }
  }

  // Highlight the selected circles.
  function brushed({selection}, [i, j]) {
    let selected = [];
    if (selection) {
      const [[x0, y0], [x1, y1]] = selection;
      selected = data.filter(d => x0 <= xScale[i](d[i]) && xScale[i](d[i]) <= x1 && y0 <= yScale[j](d[j]) && yScale[j](d[j]) <= y1);
    }
    cell.selectAll("circle")
      .classed("hidden", d => !selected.includes(d));
  }
});
