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

  // Add x-axis labels
  svg.selectAll(".x-label")
    .data(variables)
    .enter().append("text")
    .attr("class", "x-label")
    .attr("x", (d, i) => i * size + size / 2)
    .attr("y", size * variables.length + padding / 2)
    .attr("text-anchor", "middle")
    .text(d => d);

  // Add y-axis labels
  svg.selectAll(".y-label")
    .data(variables)
    .enter().append("text")
    .attr("class", "y-label")
    .attr("x", -padding / 2)
    .attr("y", (d, i) => i * size + size / 2)
    .attr("text-anchor", "end")
    .attr("dy", ".32em")
    .attr("transform", "rotate(-90)")
    .text(d => d);

  // Define the brush
  const brush = d3.brush()
    .extent([[padding / 2, padding / 2], [size - padding / 2, size - padding / 2]])
    .on("brush", brushed);

  // Apply the brush to each cell
  cell.call(brush);

  // Function to handle brush events
  function brushed(event) {
    const selection = event.selection;
    
    svg.selectAll("circle").classed("hidden", function(d) {
      let isHidden = false;
      
      variables.forEach(x => {
        variables.forEach(y => {
          if (selection && (selection[0][0] > xScale[x](d[x]) || selection[1][0] < xScale[x](d[x]) ||
                            selection[0][1] > yScale[y](d[y]) || selection[1][1] < yScale[y](d[y]))) {
            isHidden = true;
          }
        });
      });
      
      return isHidden;
    });
  }
});
