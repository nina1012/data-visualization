const eduURL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const countiesURL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

const w = 1000;
const h = 700;
const p = 40;

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

const fetchingDataFromURLS = async (eduURL, contURL) => {
  const educationsResponse = await fetch(eduURL);
  const educationsData = await educationsResponse.json();

  const countiesResponse = await fetch(contURL);
  const counties = await countiesResponse.json();

  // get the path
  const path = d3.geoPath();

  // data from topojson library
  const data = topojson.feature(counties, counties.objects.counties).features;

  // calculation minEducation, maxEducation and step
  const minEdu = d3.min(educationsData, (edu) => edu.bachelorsOrHigher);
  const maxEdu = d3.max(educationsData, (edu) => edu.bachelorsOrHigher);
  const step = (maxEdu - minEdu) / 8;

  const colorsScale = d3
    .scaleThreshold()
    .domain(d3.range(minEdu, maxEdu, step))
    .range(d3.schemeGreens[9]);
  const colors = [];

  for (let i = minEdu; i <= maxEdu; i += step) {
    colors.push(i);
  }

  mainSvgContainer
    .append("g")
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("fill", (d) =>
      colorsScale(
        educationsData.find((ed) => ed.fips === d.id).bachelorsOrHigher
      )
    )
    .attr("d", path)
    .attr("data-fips", (d) => d.id)
    .attr(
      "data-education",
      (d) => educationsData.find((ed) => ed.fips === d.id).bachelorsOrHigher
    )
    .on("mouseover", function (d, i) {
      const { coordinates } = d.geometry;
      const [x, y] = coordinates[0][0];

      const education = educationsData.find((ed) => ed.fips === d.id);

      tooltip
        .transition()
        .duration(200)
        .style("position", "absolute")
        .style("opacity", 0.9)
        .attr("data-education", education.bachelorsOrHigher)
        .style("left", x - 50 + "px")
        .style("top", y - 50 + "px");

      tooltip.innerHTML = `
          <p>${education.area_name} - ${education.state}</p>
          <p>${education.bachelorsOrHigher}%</p>
        `;
    })
    .on("mouseout", () => {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // create the legend
  const legendW = 150;
  const legendH = 100;

  const legendRectW = legendW / colors.length;
  const legend = d3
    .select(".main-svg-container")
    .append("svg")
    .attr("id", "legend")
    .attr("class", "legend")
    .attr("width", legendW)
    .attr("height", legendH)
    .attr("x", 0)
    .attr("y", -h);

  legend
    .selectAll("rect")
    .data(colors)
    .enter()
    .append("rect")
    .attr("x", (_, i) => i * legendRectW)
    .attr("y", 0)
    .attr("width", legendRectW)
    .attr("height", legendH)
    .attr("fill", (c) => colorsScale(c));
};

fetchingDataFromURLS(eduURL, countiesURL);
