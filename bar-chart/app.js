const URL =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

const w = 900;
const h = 600;
const p = 60;

const mainSVGContainer = d3
  .select(".visualization-content")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

mainSVGContainer
  .append("text")
  .attr("transform", "rotate(-90)")
  .text("Gross Domestic Product")
  .attr("x", -h / 2 + p)
  .attr("y", p + 30)
  .style("color", "lightgray")
  .style("font-family", "sans-serif");

mainSVGContainer
  .append("text")
  .attr("transform", "translate(0,0)")
  .text("Years")
  .attr("x", w - 100)
  .attr("y", h - 10)
  .style("color", "lightgray")
  .style("font-family", "sans-serif");

fetch(URL)
  .then((response) => response.json())
  .then((DATA) => {
    const { data } = DATA;

    const xScale = d3
      .scaleTime()
      .domain([
        d3.min(data, (d) => new Date(d[0])),
        d3.max(data, (d) => new Date(d[0]))
      ])
      .range([p, w - p]);

    const barW = (w - 2 * p) / data.length;

    const quaters = (time) => {
      const month = time.substring(5, 7);
      let Q;
      switch (true) {
        case month === "04":
          Q = "Q1";
          break;
        case month === "07":
          Q = "Q2";
          break;
        case month === "10":
          Q = "Q3";
          break;
        default:
          Q = "Q4";
      }
      return Q;
    };

    const tooltip = d3
      .select(".visualization-content")
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0)
      .style("width", "150px")
      .style("height", "70px")
      .style("position", "absolute");

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[1])])
      .range([h - p, p]);

    // My chart should have a g element x-axis with a corresponding id="x-axis".
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    // x Axis
    mainSVGContainer
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${h - p})`)
      .call(xAxis);
    h;

    // y Axis
    mainSVGContainer
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${p},0)`)
      .call(yAxis);

    // My chart should have a rect element for each data point with a corresponding class="bar" displaying the data.
    mainSVGContainer
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("data-date", (d, i) => d[0])
      .attr("data-gdp", (d, i) => d[1])
      .attr("width", barW)
      .attr("height", (d) => h - p - yScale(d[1]))
      .attr("x", (d) => xScale(new Date(d[0])))
      .attr("y", (d) => yScale(d[1]))
      .style("fill", "#e41dc7")
      //  I can mouse over an area and see a tooltip with a corresponding id="tooltip" which displays more information about the area.
      .on("mouseover", (e, d) => {
        const [time, gdp] = d;
        const year = time.substring(0, 4);
        tooltip.transition().style("opacity", 1);
        tooltip
          .html(
            `${year} ${quaters(time)}<br/>
          ${gdp}
        `
          )
          .attr("data-date", time)
          .attr("left", time.substring(0, 4));
      })

      // when hovering is over, remove the tooptip visual
      .on("mouseout", (e, d) => {
        tooltip.transition().duration(300).style("opacity", 0);
      });
  });
