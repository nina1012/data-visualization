const URL =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

// dimensions of mainSvgContainer
const h = 540;
const w = 1603;
const p = 60;

const mainSvgContainer = d3
  .select(".visualization-content")
  .append("svg")
  .attr("width", w)
  .attr("height", h)
  .attr("class", "main-svg-container")
  .style("background-color", "white")
  .style("z-index", 1)
  .style("position", "relative");

const tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0)
  .attr("width", "150px")
  .attr("height", "75px");

fetch(URL)
  .then((response) => response.json())
  .then((data) => {
    const { baseTemperature, monthlyVariance } = data;
    const colors = [
      "#5e4fa2",
      "#3288bd",
      "#66c2a5",
      "#abdda4",
      "#e6f598",
      "#ffffbf",
      "#fee08b",
      "#fdae61",
      "#f46d43",
      "#d53e4f",
      "#9e0142"
    ];

    // based on variance, fill the cell with right color
    const fillWithColor = (value) => {
      if (value < -6) {
        return colors[0];
      } else if (value < -5) {
        return colors[1];
      } else if (value < -4) {
        return colors[2];
      } else if (value < -3) {
        return colors[3];
      } else if (value < -2) {
        return colors[4];
      } else if (value < -1) {
        return colors[5];
      } else if (value < 0) {
        return colors[6];
      } else if (value < 1) {
        return colors[7];
      } else if (value < 2) {
        return colors[8];
      } else if (value < 3) {
        return colors[9];
      } else if (value < 4) {
        return colors[10];
      } else {
        return colors[11];
      }
    };
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    // get year without repeating
    const uniqueYears = [...new Set(monthlyVariance.map((d) => d.year))];
    const variances = monthlyVariance.map((d) => d.variance);
    const barW = w / uniqueYears.length;
    const barH = h / months.length;
    const [minVariance, maxVariance] = d3.extent(
      monthlyVariance,
      (d) => d.variance
    );

    // colorScale.quantile will return the array of variances and based on those values it will depend what color should be used in order to fill the cell
    const colorScale = d3
      .scaleQuantile()
      .domain([minVariance + baseTemperature, maxVariance + baseTemperature])
      .range(colors);

    const minYear = d3.min(uniqueYears);
    const maxYear = d3.max(uniqueYears);
    const [minDate, maxDate] = [new Date(minYear, 0), new Date(maxYear, 0)];

    //SCALES

    const xScale = d3
      .scaleTime()
      .domain([
        new Date(
          d3.min(monthlyVariance, (d) => d.year),
          0
        ),
        new Date(
          d3.max(monthlyVariance, (d) => d.year),
          0
        )
      ])
      .range([p, w - p]);
    const yScale = d3
      .scaleTime()
      .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
      .range([p, h - p]);

    // My heat map should have an x-axis with a corresponding id="x-axis"
    const xAxis = d3.axisBottom(xScale);

    // My heat map should have an y-axis with a corresponding id="y-axis"
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B"));
    mainSvgContainer
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", "translate(0," + (h - p) + ")")
      .call(xAxis);
    mainSvgContainer
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", "translate(" + p + ",0)")
      .call(yAxis);

    //  My heat map should have rect elements with a class="cell" that represent the data.
    mainSvgContainer
      .selectAll("rect")
      .data(monthlyVariance, (d) => d.year + ":" + d.month)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", (d) => xScale(new Date(d.year, 0)))
      .attr("y", (d) => yScale(new Date(0, d.month - 1)))
      .attr("width", (w - p * 2) / 262) // number of temps
      .attr("height", (h - p * 2) / 12) // number of months
      .attr("data-month", (d) => d.month - 1)
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) => baseTemperature + d.variance)
      .style("fill", (d) => fillWithColor(d.variance))
      //I can mouse over an area and see a tooltip with a corresponding id="tooltip" which displays more information about the area.
      .on("mouseover", function (e, d) {
        tooltip
          .transition()
          .duration(200)
          .attr("data-year", (d) => Math.ceil(this.dataset.year))
          .style("opacity", 1)
          .style("left", e.pageX + "px")
          .style("top", e.pageY - 28 + "px");

        tooltip
          .html(`<p>Year: ${d.year} Month: ${months[d.month - 1]}</p>`)
          .style("left", e.pageX + "px")
          .style("top", e.pageY - 28 + "px");
      })
      .on("mouseout", (d) => {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    //My heat map should have a legend with a corresponding id="legend"
    const legend = d3
      .select("svg")
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${p},${h - 10})`)
      .attr("width", "150px")
      .attr("height", "75px")
      .attr("x", 0)
      .attr("y", 0);
    // My legend should contain rect elements.
    // The rect elements in the legend should use at least 4 different fill colors
    legend
      .selectAll("rect")
      .data(colors)
      .enter()
      .append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("x", (d, i) => i * 10)
      .style("fill", (d, i) => colors[i]);
  });
