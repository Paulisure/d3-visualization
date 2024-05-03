document.addEventListener('DOMContentLoaded', async function() {
  const data = await d3.csv("heart_failure_clinical_records_dataset.csv");

  const width = 1400;
  const height = width;
  const padding = 20;
  const variables = ['age', 'serum_creatinine', 'ejection_fraction', 'high_blood_pressure', 'anaemia', 'smoking', 'serum_sodium', 'diabetes', 'sex', 'platelets'];
  const columns = variables;
  const size = (width - (columns.length + 1) * padding) / columns.length + padding;

  // Define the SVG element AFTER data is loaded and variables are set
  const svg = d3.select("#scatterplot_matrix").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 -${padding * 1.5} ${width} ${height}`);

  // Text title added after SVG definition
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", padding / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text("Finding Meaning in Heart Disease Patient Outcomes");
  
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
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - 200}, ${padding})`);  // Position the legend in the upper right
    
  legend.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 6)
    .style("fill", "red");
  
  legend.append("text")
    .attr("x", 10)
    .attr("y", 5)
    .text("Death Event")
    .style("font-size", "12px")
    .attr("alignment-baseline","middle");
  
  legend.append("circle")
    .attr("cx", 0)
    .attr("cy", 20)
    .attr("r", 6)
    .style("fill", "green");
  
  legend.append("text")
    .attr("x", 10)
    .attr("y", 25)
    .text("Non-Death Event")
    .style("font-size", "12px")
    .attr("alignment-baseline","middle");

  });
  
  // Define the companion vertical scales (one for each column).
  const y = x.map(x => x.copy().range([size - padding / 2, padding / 2]));
  
  // Define the color scale.
  const color = d3.scaleOrdinal()
    .domain(["0", "1"])
    .range(["green", "red"]);
  
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
  function brushed({selection}, [i, j]) {
      if (selection) {
          const [[x0, y0], [x1, y1]] = selection;
          svg.selectAll("circle")
              .style("fill", d =>
                  x0 <= x[i](d[columns[i]]) && x[i](d[columns[i]]) <= x1 &&
                  y0 <= y[j](d[columns[j]]) && y[j](d[columns[j]]) <= y1 ? "red" : "#ccc"
              )
              .attr("r", d =>
                  x0 <= x[i](d[columns[i]]) && x[i](d[columns[i]]) <= x1 &&
                  y0 <= y[j](d[columns[j]]) && y[j](d[columns[j]]) <= y1 ? 5 : 2
              ); // Larger size for selected, smaller for others
      } else {
          svg.selectAll("circle").style("fill", "red").attr("r", 3.5); // Reset to default
      }
  }
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
    const barChartWidth = 500;
    const barChartHeight = 350;
    const barChartMargin = { top: 80, right: 20, bottom: 60, left: 60 };
  
    const barChartSvg = d3.select("#bar_chart")
      .html("") // Clear previous chart
      .append("svg")
      .attr("width", barChartWidth + barChartMargin.left + barChartMargin.right)
      .attr("height", barChartHeight + barChartMargin.top + barChartMargin.bottom)
      .append("g")
      .attr("transform", `translate(${barChartMargin.left},${barChartMargin.top})`);
  
    const fields = columns.filter(column => !["DEATH_EVENT"].includes(column));
  
    const impactData = fields.map(field => {
      let selectedPositive, selectedTotal, allPositive, allTotal;
  
      if (["age", "ejection_fraction", "serum_sodium", "platelets"].includes(field)) {
        const selectedMedian = d3.median(selectedData, d => +d[field]);
        const allMedian = d3.median(allData, d => +d[field]);
  
        selectedPositive = selectedData.filter(d => d.DEATH_EVENT === "1" && +d[field] >= selectedMedian).length;
        selectedTotal = selectedData.filter(d => +d[field] >= selectedMedian).length;
        allPositive = allData.filter(d => d.DEATH_EVENT === "1" && +d[field] >= allMedian).length;
        allTotal = allData.filter(d => +d[field] >= allMedian).length;
      } else {
        selectedPositive = selectedData.filter(d => d.DEATH_EVENT === "1" && d[field] === "1").length;
        selectedTotal = selectedData.filter(d => d[field] === "1").length;
        allPositive = allData.filter(d => d.DEATH_EVENT === "1" && d[field] === "1").length;
        allTotal = allData.filter(d => d[field] === "1").length;
      }
  
      const selectedPositivePercentage = selectedTotal > 0 ? selectedPositive / selectedTotal : 0;
      const allPositivePercentage = allTotal > 0 ? allPositive / allTotal : 0;
  
      const impactFactor = selectedPositivePercentage / allPositivePercentage;
  
      return {
        field,
        impactFactor: isNaN(impactFactor) ? 0 : impactFactor
      };
    });
  
    impactData.sort((a, b) => b.impactFactor - a.impactFactor);
  
    const xScale = d3.scaleBand()
      .domain(impactData.map(d => d.field))
      .range([0, barChartWidth])
      .padding(0.2);
  
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(impactData, d => d.impactFactor)])
      .range([barChartHeight, 0]);
  
    // Add title and subtitle
    const title = barChartSvg.append("text")
      .attr("x", barChartWidth / 2)
      .attr("y", -barChartMargin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Impact Factors of Selected Fields");
  
    const subtitle = barChartSvg.append("text")
      .attr("x", barChartWidth / 2)
      .attr("y", -barChartMargin.top / 4)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Comparing the influence of fields on positive death events");
  
    // Improve axis labels
    barChartSvg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -barChartHeight / 2)
      .attr("y", -barChartMargin.left + 15)
      .attr("text-anchor", "middle")
      .text("Impact Factor");
  
    barChartSvg.append("text")
      .attr("x", barChartWidth / 2)
      .attr("y", barChartHeight + barChartMargin.bottom - 5)
      .attr("text-anchor", "middle")
      .text("Fields");
  
    barChartSvg.append("g")
      .attr("transform", `translate(0,${barChartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");
  
    barChartSvg.append("g")
      .call(d3.axisLeft(yScale));
  
    // Highlight top influential fields
    const topCount = 3; // Number of top influential fields to highlight
  
    barChartSvg.selectAll(".bar")
      .data(impactData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.field))
      .attr("y", d => yScale(d.impactFactor))
      .attr("width", xScale.bandwidth())
      .attr("height", d => barChartHeight - yScale(d.impactFactor))
      .attr("fill", (d, i) => i < topCount ? "darkred" : "steelblue");
  
    // Add tooltips
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  
    barChartSvg.selectAll(".bar")
      .on("mouseover", function(event, d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(`Field: ${d.field}<br>Impact Factor: ${d3.format(".2f")(d.impactFactor)}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
  
    barChartSvg.selectAll(".bar-label")
      .data(impactData)
      .join("text")
      .attr("class", "bar-label")
      .attr("x", d => xScale(d.field) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.impactFactor) - 5)
      .attr("text-anchor", "middle")
      .text(d => d3.format(".2f")(d.impactFactor));
  }
