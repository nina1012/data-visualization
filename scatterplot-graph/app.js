const URL =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

const w = 900;
const h = 600;
const p = 50;

// svg container where graph will be placed
const mainSvgContainer = d3
  .select(".visualization-content")
  .append("svg")
  .attr("width", w)
  .attr("height", h)
  .attr("class", "main-svg-container");

const tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0)
  .attr("width", "150px")
  .attr("height", "75px");
// getting the data from given url
fetch(URL)
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    const years = data.map((d) => d.Year);
    const minAndSec = data.map((d) => {
      const arr = d.Time.split(":");
      const minutes = +arr[0] * 60;
      const seconds = +arr[1];
      return minutes + seconds;
    });
    // getting the date objects and sorting them in ascending order
    let times = data
      .map((d) => new Date(`${d.Year}-01-01 00:${d.Time}`))
      .sort((a, b) => a - b);

    // scales
    const xScale = d3
      .scaleLinear()
      .domain([d3.min(years), d3.max(years)])
      .range([p, w - p]);

    const minTime = d3.min(minAndSec);

    const maxTime = d3.max(minAndSec);

    const yScale = d3
      .scaleLinear()
      .domain([minTime, maxTime])
      .range([p, h - p]);

    // axis
    const xAxis = d3.axisBottom(xScale).tickFormat((d) => d.toString());
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => {
      const minutes = Math.floor(d / 60);
      const seconds = parseInt(d % 60) === 0 ? "00" : parseInt(d % 60);
      return minutes + ":" + seconds;
    });

    // putting the axis on the graph inside main svg container
    mainSvgContainer
      .append("g")
      .attr("transform", `translate(0,${h - p})`)
      .attr("id", "x-axis")
      .call(xAxis);
    mainSvgContainer
      .append("g")
      .data(times)
      .attr("transform", `translate(${p},0)`)
      .attr("id", "y-axis")
      .call(yAxis);

    // for each person in data, create a circle with class dot and place it depending on data
    mainSvgContainer
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.Year))
      .attr("cy", (d) => {
        const time = d.Time.split(":");
        const minutes = +time[0] * 60;
        const seconds = +time[1];
        return yScale(minutes + seconds);
      })
      .attr("r", 5)
      .style("fill", (d) => (d.Doping ? "red" : "green"))
      .attr("data-xvalue", (d) => d.Year)
      .attr("data-yvalue", (d) => new Date(`${d.Year}-01-01 00:${d.Time}`))
      .text(
        (d) =>
          `<p class="bold">${d.Name}</p> <p>Year: ${d.Year}  Time: ${d.Time}</p><p>${d.Doping}</p>`
      )
      // on mouse over
      .on("mouseover", function (e, d) {
        tooltip
          .transition()
          .duration(200)
          .style("background-color", d.Doping ? "#cc1215" : "green")
          .style("position", "absolute")
          .style("color", "white")
          .style("opacity", 0.9)

          .attr("data-year", (d) => this.dataset.xvalue)
          .style("left", e.pageX + "px")
          .style("top", e.pageY - 28 + "px");
        tooltip
          .html(
            `<p class="bold">${d.Name}</p> <p>Year: ${d.Year}  Time: ${d.Time}</p><p>${d.Doping}</p>`
          )
          .style("left", e.pageX + "px")
          .style("top", e.pageY - 28 + "px");
      })
      .on("mouseout", (d) => {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    //I can see a legend containing descriptive text that has id="legend"
    const legend = d3
      .select("svg")
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${w - 50},${h / 3})`);

    // circles and text for legend, both for riders with doping allegations and for those who are not

    mainSvgContainer
      .append("g")
      .append("circle")
      .attr("cx", w * 0.8)
      .attr("cy", h * 0.8 + 30)
      .attr("r", 5)
      .style("fill", "green");

    mainSvgContainer
      .append("g")
      .append("text")
      .attr("x", w * 0.8 + 10)
      .attr("y", h * 0.8 + 40)
      .text("No doping allegations");

    mainSvgContainer
      .append("g")
      .append("circle")
      .attr("cx", w * 0.8)
      .attr("cy", h * 0.8)
      .attr("r", 5)
      .style("fill", "red");

    mainSvgContainer
      .append("g")
      .append("text")
      .attr("x", w * 0.8 + 10)
      .attr("y", h * 0.8)
      .text("Riders with doping allegations");
  });
