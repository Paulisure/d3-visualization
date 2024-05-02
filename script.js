document.addEventListener('DOMContentLoaded', function() {
    console.log('JavaScript loaded!');

    d3.csv("heart_failure_clinical_records_dataset.csv", d => ({
        age: +d.age,
        ejectionFraction: +d.ejection_fraction,
        serumCreatinine: +d.serum_creatinine,
        // continue mapping other fields
    })).then(function(data) {
        console.log(data); // Check data load
        drawChart(data); // Initial chart draw
        setupDropdown(data); // Setup dropdown change handler
    });

    function setupDropdown(data) {
        d3.select('#variable-select').on('change', function() {
            var selectedVariable = d3.select(this).property('value');
            updateVisualization(selectedVariable, data);
        });
    }

    function drawChart(data) {
        // your existing drawChart function...
    }

    function updateVisualization(selectedVariable, data) {
        // Clear existing content
        d3.select('#chart svg').remove();

        // Redraw the chart based on the selected variable
        drawChart(data, selectedVariable);
    }
});

function drawChart(data, variable = 'age') {
    const svgWidth = 460, svgHeight = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 90 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select("#chart").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Update scales based on selected variable
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[variable])])
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    const yScale = d3.scaleLinear()
        .domain([0, 1]) // Assume binary DEATH_EVENT for simplicity
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add circles
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d[variable]))
        .attr("cy", d => yScale(d.DEATH_EVENT))
        .attr("r", 5)
        .attr("fill", d => d.DEATH_EVENT ? "red" : "green");
}
