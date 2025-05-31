const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svgLine = d3.select("#lineChart1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const svg2_RENAME = d3.select("#lineChart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("weather.csv").then(data => {
    const cities = Array.from(new Set(data.map(d => d.city))).sort();
    const dropdown = d3.select("#citySelect");

    dropdown.selectAll("option")
        .data(cities)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    drawLineChart(data, dropdown.property("value"));

    dropdown.on("change", function() {
        const selectedCity = d3.select(this).property("value");
        drawLineChart(data, selectedCity);
    });

    const recordCounts = { "Record Highs": {}, "Record Lows": {} };

    data.forEach(d => {
        if (d.record_max_temp_year) {
            const year = +d.record_max_temp_year;
            recordCounts["Record Highs"][year] = (recordCounts["Record Highs"][year] || 0) + 1;
        }
        if (d.record_min_temp_year) {
            const year = +d.record_min_temp_year;
            recordCounts["Record Lows"][year] = (recordCounts["Record Lows"][year] || 0) + 1;
        }
    });

    const years = Array.from(new Set([
        ...Object.keys(recordCounts["Record Highs"]),
        ...Object.keys(recordCounts["Record Lows"])
    ].map(Number))).sort((a, b) => a - b);

    const dataByType = type => years.map(year => ({
        year,
        count: recordCounts[type][year] || 0
    }));

    let currentType = "Record Highs";

    const xScale2 = d3.scaleBand()
        .domain(years)
        .range([0, width])
        .padding(0.2);

    const yScale2 = d3.scaleLinear().range([height, 0]);

    const updateChart2 = (type) => {
        const chartData = dataByType(type);
        yScale2.domain([0, d3.max(chartData, d => d.count) + 1]);

        const bars = svg2_RENAME.selectAll(".bar")
            .data(chartData, d => d.year);

        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale2(d.year))
            .attr("width", xScale2.bandwidth())
            .attr("y", height)
            .attr("height", 0)
            .attr("fill", "steelblue")
            .on("mouseover", function (event, d) {
                d3.select(this).attr("fill", "#1e5a8a");
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`Year: ${d.year}<br>Count: ${d.count}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("fill", "steelblue");
                tooltip.transition().duration(300).style("opacity", 0);
            })
            .merge(bars)
            .transition().duration(1000)
            .attr("x", d => xScale2(d.year))
            .attr("y", d => yScale2(d.count))
            .attr("height", d => height - yScale2(d.count));

        bars.exit().remove();

        svg2_RENAME.select(".y-axis")
            .transition().duration(1000)
            .call(d3.axisLeft(yScale2));

        svg2_RENAME.select(".title")
            .text(`${type} Set Per Year`);
    };

    svg2_RENAME.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale2).tickValues(xScale2.domain().filter((d, i) => !(i % 10))));

    svg2_RENAME.append("g").attr("class", "y-axis");

    svg2_RENAME.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold");

    svg2_RENAME.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Year");

    svg2_RENAME.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .text("Number of Records");

    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "white")
        .style("padding", "6px")
        .style("border", "1px solid #ccc")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // Hook up new record type dropdown
    d3.select("#recordType").on("change", function () {
        currentType = this.value;
        updateChart2(currentType);
    });

    updateChart2(currentType);
});

function drawLineChart(data, city) {
    svgLine.selectAll("*").remove();

    d3.select("#lineChartTitle").text(`Daily Max Temperatures in ${city}`);

    const parseDate = d3.timeParse("%m/%d/%Y");

    const filteredData = data
        .filter(d => d.city === city)
        .map(d => ({
            date: parseDate(d.date),
            maxTemp: +d.actual_max_temp
        }));

    const lineXScale = d3.scaleTime()
        .domain(d3.extent(filteredData, d => d.date))
        .range([0, width]);

    const lineYScale = d3.scaleLinear()
        .domain([d3.min(filteredData, d => d.maxTemp) - 5, d3.max(filteredData, d => d.maxTemp) + 5])
        .range([height, 0]);

    const line = d3.line()
        .x(d => lineXScale(d.date))
        .y(d => lineYScale(d.maxTemp));

    svgLine.append("path")
        .datum(filteredData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

    svgLine.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(lineXScale).tickFormat(d3.timeFormat("%b")));

    svgLine.append("g")
        .call(d3.axisLeft(lineYScale));

    svgLine.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold");

    svgLine.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Date");

    svgLine.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .text("Temperature (°F)");
}