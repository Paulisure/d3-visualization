document.addEventListener('DOMContentLoaded', function() {
    console.log('JavaScript loaded!');

    // Load and parse the data
    d3.csv("heart_failure_clinical_records_dataset.csv", function(d) {
        return {
            age: +d.age,
            anaemia: +d.anaemia,
            creatinine: +d.creatinine_phosphokinase,
            diabetes: +d.diabetes,
            ejectionFraction: +d.ejection_fraction,
            highBP: +d.high_blood_pressure,
            platelets: +d.platelets,
            serumCreatinine: +d.serum_creatinine,
            serumSodium: +d.serum_sodium,
            sex: d.sex,
            smoking: d.smoking,
            time: +d.time,
            deathEvent: +d.DEATH_EVENT
        };
    }).then(function(data) {
        console.log(data); // See the parsed data in the browser's console

        // Call function to draw the chart
        drawChart(data);
    });

    function drawChart(data) {
        // Set dimensions and margins for the chart
        const margin = {top: 20, right: 30, bottom: 40, left: 90},
            width = 460 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // Append the svg object to the div called 'chart'
        const svg = d3.select("#chart")
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Add X axis
        const x = d3.scaleLinear()
          .domain([0, 100])
          .range([0, width]);
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

        // Add Y axis
        const y = d3.scaleLinear()
          .domain([0, 500000])
          .range([height, 0]);
        svg.append("g")
          .call(d3.axisLeft(y));

        // Tooltip setup
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // Add dots and tooltips
        svg.selectAll("dot")
            .data(data)
            .enter().append("circle")
            .attr("cx", function (d) { return x(d.age); })
            .attr("cy", function (d) { return y(d.platelets); })
            .attr("r", 5)
            .style("fill", "#69b3a2")
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("Age: " + d.age + "<br/>Platelets: " + d.platelets)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        function updateVisualization(selectedVariable, data) {
            const survived = data.filter(d => d.DEATH_EVENT === 0);
            const deceased = data.filter(d => d.DEATH_EVENT === 1);
        
            // Update the scatter plot or box plot here
            // Example for updating a scatter plot:
            const circles = svg.selectAll("circle")
                .data(data);
            
            circles.enter().append("circle")
                .merge(circles)
                .attr("cx", d => xScale(d[selectedVariable]))
                .attr("cy", d => yScale(d.DEATH_EVENT)) // Simplistic; consider adjusting
                .attr("fill", d => d.DEATH_EVENT === 1 ? "red" : "green")
                .attr("r", 5);
        
            circles.exit().remove();
        }

    } // This is the missing bracket if any
}); // Close for DOMContentLoaded
