document.addEventListener('DOMContentLoaded', async function() {
  const data = await d3.csv("heart_failure_clinical_records_dataset.csv");

  // Dimensions and setup
  const size = 150;
  const padding = 20;
  const variables = ['age', 'serum_creatinine', 'ejection_fraction', 'high_blood_pressure', 'anaemia', 'smoking', 'serum_sodium', 'diabetes', 'sex', 'platelets'];
  const svg = d3.select("#scatterplot_matrix").append("svg")
    .attr("width", size * variables.length + padding)
    .attr("height", size * variables.length + padding)
    .style("font", "10px sans-serif");

  // Scales and axes setup
  const xScale = {}, yScale = {};
  variables.forEach(variable => {
    const value = d => +d[variable];
    const domain = d3.extent(data, value);
    xScale[variable] = d3.scaleLinear().domain(domain).range([padding / 2, size - padding / 2]);
    yScale[variable] = d3.scaleLinear().domain(domain).range([size - padding / 2, padding / 2]);
  });

  // Creating cells for each pair of variables
  const cell = svg.selectAll("g.cell")
    .data(d3.cross(variables, variables))
    .enter().append("g")
    .attr("class", "cell")
    .attr("transform", ([x, y], i) => `translate(${variables.indexOf(x) * size},${variables.indexOf(y) * size})`)
    .each(function([x, y]) { // Plot circles in each cell
      d3.select(this).selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScale[x](d[x]))
        .attr("cy", d => yScale[y](d[y]))
        .attr("r", 3)
        .attr("fill", d => d.DEATH_EVENT === "1" ? "red" : "green");
    });

  // Define the brush
  const brush = d3.brush()
    .extent([[padding / 2, padding / 2], [size - padding / 2, size - padding / 2]])
    .on("brush", brushed);

  // Apply the brush to each cell
  cell.call(brush);

  // Function to handle brush events
  function brushed(event, [x, y]) {
    if (event.selection) {
      const [[x0, y0], [x1, y1]] = event.selection;
      svg.selectAll("circle").classed("hidden", d => {
        return x0 > xScale[x](d[x]) || x1 < xScale[x](d[x]) ||
               y0 > yScale[y](d[y]) || y1 < yScale[y](d[y]);
      });
    } else {
      svg.selectAll("circle").classed("hidden", false);
    }
  }
});
