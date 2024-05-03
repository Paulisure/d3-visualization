document.addEventListener('DOMContentLoaded', async function() {
  const data = await d3.csv("heart_failure_clinical_records_dataset.csv");
  
  // Specify the chart's dimensions.
  const width = 1206;
  const height = width;
  const padding = 36;
  const variables = ['age', 'serum_creatinine', 'ejection_fraction', 'high_blood_pressure', 'anaemia', 'smoking', 'serum_sodium', 'diabetes', 'sex', 'platelets'];
  const columns = variables;
  const size = (width - (columns.length + 1) * padding) / columns.length + padding;
  
  // Define the horizontal scales (one for each row).
  const x = columns.map(c => {
    if (c === 'high_blood_pressure' || c === 'anaemia' || c === 'smoking' || c === 'diabetes') {
      return d3.scaleOrdinal()
        .domain(["0", "1"])
        .range([padding / 2, size - padding / 2]);
    } else if (c === 'sex') {
      return d3.scaleOrdinal()
        .domain(["0", "1"])
        .range([padding / 2, size - padding / 2]);
    } else if (c === 'platelets') {
      return d3.scaleLinear()
        .domain([0, 800000])
        .rangeRound([padding / 2, size - padding / 2]);
    } else {
      return d3.scaleLinear()
        .domain(d3.extent(data, d => +d[c]))
        .rangeRound([padding / 2, size - padding / 2]);
    }
  });
  
  // Define the companion vertical scales (one for each column).
  const y = x.map(x => x.copy().range([size - padding / 2, padding / 2]));
  
  // Define the color scale.
  const color = d3.scaleOrdinal()
    .domain(["0", "1"])
    .range(["green", "red"]);
  
  const svg = d3.select("#scatterplot_matrix").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-padding, 0, width, height]);
  
  svg.append("style")
    .text(`circle.hidden { fill: #000; fill-opacity: 1; r: 1px; }`);
  
  // Define the horizontal axis (it will be applied separately for each column).
  const axisx = d3.axisBottom()
    .ticks(6)
    .tickSize(size * columns.length)
    .tickFormat(d => {
      if (typeof d === 'number') {
        if (d >= 1000) {
          return `${d / 1000}k`;
        }
        return d;
      } else {
        if (d === '0') {
          return 'Female';
        } else if (d === '1') {
          return 'Male';
        } else {
          return d === '0' ? 'No' : 'Yes';
        }
      }
    });
  
  const xAxis = g => g.selectAll("g").data(x).join("g")
    .attr("transform", (d, i) => `translate(${i * size},0)`)
    .each(function(d) { return d3.select(this).call(axisx.scale(d)); })
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"));
  
  // Define the vertical axis (it will be applied separately for each row).
  const axisy = d3.axisLeft()
    .ticks(6)
    .tickSize(-size * columns.length)
    .tickFormat(d => {
      if (typeof d === 'number') {
        if (d >= 1000) {
          return `${d / 1000}k`;
        }
        return d;
      } else {
        if (d === '0') {
          return 'Female';
        } else if (d === '1') {
          return 'Male';
        } else {
          return d === '0' ? 'No' : 'Yes';
        }
      }
    });
  
  const yAxis = g => g.selectAll("g").data(y).join("g")
    .attr("transform", (d, i) => `translate(0,${i * size})`)
    .each(function(d) { return d3.select(this).call(axisy.scale(d)); })
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"));

  svg.append("g")
    .call(xAxis);
  
  svg.append("g")
    .call(yAxis);
  
  svg.append("g")
    .style("font", "bold 10px sans-serif")
    .style("pointer-events", "none")
    .selectAll("text")
    .data(columns)
    .join("text")
    .attr("transform", (d, i) => `translate(${i * size},${i * size})`)
    .attr("x", padding)
    .attr("y", padding)
    .attr("dy", ".71em")
    .text(d => d);

  const cell = svg.append("g")
    .selectAll("g")
    .data(d3.cross(d3.range(columns.length), d3.range(columns.length)))
    .join("g")
    .attr("transform", ([i, j]) => `translate(${i * size},${j * size})`);
  
  cell.append("rect")
    .attr("fill", "none")
    .attr("stroke", "#aaa")
    .attr("x", padding / 2 + 0.5)
    .attr("y", padding / 2 + 0.5)
    .attr("width", size - padding)
    .attr("height", size - padding);
  
  cell.each(function([i, j]) {
    d3.select(this).selectAll("circle")
      .data(data.filter(d => !isNaN(d[columns[i]]) && !isNaN(d[columns[j]])))
      .join("circle")
      .attr("cx", d => x[i](d[columns[i]]))
      .attr("cy", d => y[j](d[columns[j]]));
  });

  const circle = cell.selectAll("circle")
    .attr("r", 3.5)
    .attr("fill-opacity", 0.7)
    .attr("fill", d => color(d.DEATH_EVENT));

  // Add event listener for the death event checkbox
  d3.select("#death-event-checkbox").on("change", function() {
    const checked = d3.select(this).property("checked");
    if (checked) {
      circle.attr("fill", d => d.DEATH_EVENT === "1" ? color(d.DEATH_EVENT) : "none");
    } else {
      circle.attr("fill", d => color(d.DEATH_EVENT));
    }
  });

  // Ignore this line if you don't need the brushing behavior.
  cell.call(brush, circle, svg, { padding, size, x, y, columns, data });
});

function brush(cell, circle, svg, { padding, size, x, y, columns, data }) {
  const brush = d3.brush()
    .extent([[padding / 2, padding / 2], [size - padding / 2, size - padding / 2]])
    .on("start", brushstarted)
    .on("brush", brushed)
    .on("end", brushended);

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
  function brushed({ selection }, [i, j]) {
    let selected = [];
    if (selection) {
      const [[x0, y0], [x1, y1]] = selection;
      circle.classed("hidden", d =>
        x0 > x[i](d[columns[i]])
        || x1 < x[i](d[columns[i]])
        || y0 > y[j](d[columns[j]])
        || y1 < y[j](d[columns[j]])
      );
      selected = data.filter(d =>
        x0 < x[i](d[columns[i]])
        && x1 > x[i](d[columns[i]])
        && y0 < y[j](d[columns[j]])
        && y1 > y[j](d[columns[j]])
      );
    }
    svg.property("value", selected).dispatch("input");

    // Update the bar chart
    updateBarChart(selected, data, columns);
  }

  // If the brush is empty, select all circles.
  function brushended({ selection }) {
    if (selection) return;
    svg.property("value", []).dispatch("input");
    circle.classed("hidden", false);
    updateBarChart(data, data, columns);
  }
}

  function updateBarChart(selectedData, allData, columns) {
    const barChartWidth = 400;
    const barChartHeight = 300;
    const barChartMargin = { top: 20, right: 20, bottom: 40, left: 40 };
  
    const barChartSvg = d3.select("#bar_chart")
      .html("") // Clear previous chart
      .append("svg")
      .attr("width", barChartWidth + barChartMargin.left + barChartMargin.right)
      .attr("height", barChartHeight + barChartMargin.top + barChartMargin.bottom)
      .append("g")
      .attr("transform", `translate(${barChartMargin.left},${barChartMargin.top})`);
  
    const selectedDeathEvents = selectedData.reduce((acc, d) => {
      acc[d.DEATH_EVENT] = (acc[d.DEATH_EVENT] || 0) + 1;
      return acc;
    }, {});
    
    const allDeathEvents = allData.reduce((acc, d) => {
      acc[d.DEATH_EVENT] = (acc[d.DEATH_EVENT] || 0) + 1;
      return acc;
    }, {});
  
    const selectedTotal = selectedData.length;
    const allTotal = allData.length;
  
    const selectedPositivePercentage = (selectedDeathEvents["1"] || 0) / selectedTotal;
    const selectedNegativePercentage = (selectedDeathEvents["0"] || 0) / selectedTotal;
    const allPositivePercentage = (allDeathEvents["1"] || 0) / allTotal;
    const allNegativePercentage = (allDeathEvents["0"] || 0) / allTotal;
  
    const xScale = d3.scaleBand()
      .domain(["Selected", "All"])
      .range([0, barChartWidth])
      .padding(0.2);
  
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([barChartHeight, 0]);
  
    barChartSvg.append("g")
      .attr("transform", `translate(0,${barChartHeight})`)
      .call(d3.axisBottom(xScale));
  
    barChartSvg.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d3.format(".0%")));
  
    const barGroups = barChartSvg.selectAll(".bar-group")
      .data([
        { category: "Selected", positivePercentage: selectedPositivePercentage, negativePercentage: selectedNegativePercentage },
        { category: "All", positivePercentage: allPositivePercentage, negativePercentage: allNegativePercentage }
      ])
      .join("g")
      .attr("class", "bar-group")
      .attr("transform", d => `translate(${xScale(d.category)},0)`);
  
    barGroups.append("rect")
      .attr("class", "positive-bar")
      .attr("x", 0)
      .attr("y", d => yScale(d.positivePercentage))
      .attr("width", xScale.bandwidth())
      .attr("height", d => barChartHeight - yScale(d.positivePercentage))
      .attr("fill", "red");
  
    barGroups.append("rect")
      .attr("class", "negative-bar")
      .attr("x", 0)
      .attr("y", d => yScale(1))
      .attr("width", xScale.bandwidth())
      .attr("height", d => barChartHeight - yScale(d.negativePercentage))
      .attr("fill", "green");
  
    barGroups.append("text")
      .attr("class", "percentage-label")
      .attr("x", xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.positivePercentage) - 5)
      .attr("text-anchor", "middle")
      .text(d => d3.format(".0%")(d.positivePercentage));
  }

