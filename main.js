// 1: SET GLOBAL VARIABLE
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svgLine = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
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

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

// 2.a: LOAD...
d3.csv("weather.csv").then(data => {
    // 2.b: ... AND TRANSFORM DATA
    const parseDate = d3.timeParse("%m/%d/%Y");

    const filteredData = data
        .filter(d => d.city === "Chicago")
        .map(d => ({
            date: parseDate(d.date),
            maxTemp: +d.actual_max_temp
        }));

    
    // 3.a: SET SCALES FOR CHART 1
    const lineXScale = d3.scaleTime()
        .domain(d3.extent(filteredData, d => d.date))
        .range([0, width]);

    const lineYScale = d3.scaleLinear()
        .domain([d3.min(filteredData, d => d.maxTemp) - 5, d3.max(filteredData, d => d.maxTemp) + 5])
        .range([height, 0]);
    

    // 4.a: PLOT DATA FOR CHART 1
    const line = d3.line()
        .x(d => lineXScale(d.date))
        .y(d => lineYScale(d.maxTemp));

    svgLine.append("path")
        .datum(filteredData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

    // 5.a: ADD AXES FOR CHART 1
    svgLine.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(lineXScale).tickFormat(d3.timeFormat("%b")));

    svgLine.append("g")
        .call(d3.axisLeft(lineYScale));


    // 6.a: ADD LABELS FOR CHART 1
    svgLine.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .text("Daily Max Temperatures in Chicago")
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


    // 7.a: ADD INTERACTIVITY FOR CHART 1
    

    // ==========================================
    //         CHART 2 (if applicable)
    // ==========================================

    // 3.b: SET SCALES FOR CHART 2


    // 4.b: PLOT DATA FOR CHART 2


    // 5.b: ADD AXES FOR CHART 


    // 6.b: ADD LABELS FOR CHART 2


    // 7.b: ADD INTERACTIVITY FOR CHART 2


});