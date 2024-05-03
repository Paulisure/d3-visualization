document.addEventListener('DOMContentLoaded', async function() {
    const data = await d3.csv("heart_failure_clinical_records_dataset.csv");

    // Dimensions for each individual plot
    const size = 150;
    const padding = 20;
    const variables = ['age', 'serum_creatinine', 'ejection_fraction', 'high_blood_pressure', 'anaemia']; // Add your variables

    const svg = d3.select("#scatterplot_matrix").append("svg")
        .attr("width", size * variables.length + padding)
        .attr("height", size * variables.length + padding)
        .style("font", "10px sans-serif");

    const xScale = {}, yScale = {};
    variables.forEach(variable => {
        const value = d => d[variable];
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
        .attr("transform", ([x, y]) => `translate(${variables.indexOf(x) * size},${variables.indexOf(y) * size})`);

    cell.each(function([x, y]) {
        d3.select(this).selectAll("circle")
            .data(data)
            .join("circle")
            .attr("cx", d => xScale[x](d[x]))
            .attr("cy", d => yScale[y](d[y]))
            .attr("r", 4)
            .style("fill-opacity", 0.7)
            .style("fill", d => d.deathEvent === "1" ? "red" : "steelblue");
    });

    // Adding brushing
    cell.call(d3.brush()
        .extent([[padding / 2, padding / 2], [size - padding / 2, size - padding / 2]])
        .on("start brush", brushed));

    function brushed({selection}, [x, y]) {
        if (selection) {
            const [[x0, y0], [x1, y1]] = selection;
            svg.selectAll("circle")
                .classed("hidden", d => x0 > xScale[x](d[x]) || x1 < xScale[x](d[x]) || y0 > yScale[y](d[y]) || y1 < yScale[y](d[y]));
        } else {
            svg.selectAll("circle").classed("hidden", false);
        }
    }
});
