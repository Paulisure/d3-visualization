document.addEventListener('DOMContentLoaded', function() {
    console.log('JavaScript loaded!');

    // Load and parse the data
    d3.csv("C:\Users\paul_\OneDrive - Indiana University\Current Classes\Data Visualization\heart_failure_clinical_records_dataset.csv", function(d) {
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

    // Function to draw the chart
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
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

        // Add X axis
        const x = d3.scaleLinear()
          .domain([0, 100])
          .range([ 0, width ]);
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

        // Add Y axis
        const y = d3.scaleLinear()
          .domain([0, 500000])
          .range([ height, 0]);
        svg.append("g")
          .call(d3.axisLeft(y));

        // Add dots
        svg.append('g')
          .selectAll("dot")
          .data(data)
          .enter()
          .append("circle")
            .attr("cx", function (d) { return x(d.age); } )
            .attr("cy", function (d) { return y(d.platelets); } )
            .attr("r", 5)
            .style("fill", "#69b3a2")
    }
});