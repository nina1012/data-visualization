const colors = [
  "rgb(76, 146, 195)", // blue;
  "rgb(255, 153, 62)", // orange
  "rgb(173, 229, 161)", // mint
  "rgb(222, 82, 83)", // red
  "rgb(190, 210, 237)", // lightblue
  "rgb(255, 201, 147)", // peach
  "rgb(86, 179, 86)", // green
  "rgb(255, 173, 171)", // lightpink
  "rgb(169, 133, 202)", // darkviolet
  "rgb(209, 192, 221)", // lightviolet
  "rgb(163, 120, 111)", // brown
  "rgb(233, 146, 206)", // pink
  "rgb(249, 197, 219)", // lighterpink
  "rgb(208, 176, 169)", // lightbrown
  "rgb(153, 153, 153)", // darkgray
  "rgb(210, 210, 210)", // gray
  "rgb(201, 202, 78)", // yellow
  "rgb(226, 226, 164)" // lightyellow
];

const kickstartedPledgeURL =
  " https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";

const moviesSalesURL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";

const videoGamesSalesURL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

const w = 1000;
const h = 700;
const p = 50;

const mainSvgContainer = d3
  .select(".visualization-content")
  .append("svg")
  .attr("class", "main-svg-container")
  .attr("width", w)
  .attr("height", h);

const tooltip = document.getElementById("tooltip");

const color = d3.scaleOrdinal(
  colors.map(function (color) {
    color = d3.interpolateRgb(color, "#fff")(0);
    return color;
  })
);

const treemap = d3.treemap().size([w, h]).paddingInner(5);

fetch(videoGamesSalesURL)
  .then((response) => response.json())
  .then((data) => {
    const root = d3
      .hierarchy(data)
      .eachBefore((d) => {
        d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
      })
      .sum((d) => d.value)
      .sort((a, b) => b.height - a.height || b.value - a.value);

    treemap(root);

    const cell = mainSvgContainer
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("class", "group")
      .attr("transform", (d) => `translate(${d.x0}  ,${d.y0})`);
    const formatNumber = d3.format(",");

    cell
      .append("rect")
      .attr("id", (d) => d.data.id)
      .attr("data-name", (d) => d.data.name)
      .attr("data-category", (d) => d.data.category)
      .attr("class", "tile")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("data-value", (d) => d.data.value)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => color(d.data.category))
      // on mouseover, tooltip should be visible
      .on("mouseover", function (e, d) {
        tooltip.style.opacity = 1;
        tooltip.setAttribute("data-value", this.dataset.value);
        tooltip.style.left = e.pageX + "px";
        tooltip.style.top = e.pageY + "px";

        tooltip.innerHTML =
          "Name: " +
          this.dataset.name +
          "<br>Category: " +
          this.dataset.category +
          "<br>Value: " +
          this.dataset.value;
      })
      .on("mouseout", (d) => {
        tooltip.style.opacity = 0;
      });

    //   LEGEND

    const categories = root
      .leaves()
      .map((node) => node.data.category)
      .filter((category, index, self) => self.indexOf(category) === index);

    const legend = mainSvgContainer
      .append("div")
      .attr("id", "legend")
      .attr("width", "200px")
      .attr("height", "120px")
      .style("fill", "black");

    legend
      .selectAll("rect")
      .data(categories)
      .enter()
      .append("rect")
      .attr("class", "legend-item")
      .style("fill", (d) => color(d));
  });
