const wrap = (labels) => {
  labels.each(function() {
    var text = d3.select(this),
        words = text.text().split(/[\s -]+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        x = text.attr("x"),
        width = text.attr('width'),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr('width',width - 200);
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width && line.length > 1) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + "em").text(word);
      }
    }
  });
}

const getFormattedGross = val => {
  let value;
  try {
    value = +val;
    if (typeof value !== 'number'){ return val;}
  }
  catch (err){
    return val;
  }
  let suffix = ['','k','M','B','T','Q'];
  let pow = 3;
  while(true) {
    if (value < 10 ** pow) { return `$${Math.round(value / 10 ** (pow - 3) * 100)/100}${suffix[pow / 3 - 1]} USD`}
    pow += 3;
  }
}

const getHTML = data => {
  const {name, category, value} = data;
  return `${name}<br>
          Genre: ${category}<br>
          Gross: ${getFormattedGross(value)}`
}

const buildChart = async () => {
 
  const movieSales = await d3.json(
    "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json"
  );
  
 
  const colorScheme = d3.scaleOrdinal(d3.schemeCategory10.reverse());
  const padding = { top: 80, bottom: 100, left: 100, right: 300 };
  const baseWidth = 1260;
  const baseHeight = 500;
  const width = baseWidth + padding.left + padding.top;
  const height = baseHeight + padding.top + padding.bottom;

  const svg = d3
    .select("#dataviz")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
  
   const div = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .attr('data-name','')
    .attr('data-category', '')
    .attr('data-value', "");


  const root = d3.hierarchy(movieSales).sum(d => d.value);

  d3.treemap().size([baseWidth, baseHeight])(root);
  

  svg
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
  .attr('class','tile')
  .attr('data-name',d => d.data.name)
  .attr('data-category',d => d.data.category)
  .attr('data-value',d => d.data.value)
    .attr("x", d => d.x0 + padding.left)
    .attr("y", d => d.y0 + padding.top)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .style("stroke", "white")
    .attr("fill", d=> colorScheme(d.parent.data.name))
     .on('mouseover', d => {
      div.transition()
      // .duration(0)
      .style('opacity', 1);
      div.html(getHTML(d.data))
       .attr('data-name',d.data.name)
      .attr('data-category',d.data.category )
      .attr('data-value',d.data.value)
      .style('left', (d3.event.pageX + 15) + 'px')
      .style('top', d3.event.pageY + 'px')
    })
    .on('mouseout', d => {
      div.transition()
      // .duration(0)
      .style('opacity', 0)
    });
  
  
  
  
  svg
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
    .attr("x", d => +d.x0 + padding.left + 5)
    .attr("y", d => +d.y0 + padding.top + 10)
    .attr("width", d => d.x1 - d.x0 - 10)
    .text(d => d.data.name)
    .attr("font-size", "10px")
    .attr("fill", "white");

  svg.selectAll('text').call(wrap);

    const shapeWidth = 50;
    const shapePadding = (baseWidth - 200 - shapeWidth * movieSales.children.length) / (movieSales.children.length - 1);
    const colorLegend = d3
      .legendColor()
    .orient('horizontal')
    .labelAlign('middle')
      .scale(colorScheme)
      .titleWidth(200)
      .shapePadding(shapePadding)
      .shapeWidth(shapeWidth)
      .shapeHeight(shapeWidth / 2)
      .labels(options => options.generatedLabels[options.i])
      .labelOffset(10)
      .cells(15)


    svg
      .append("g")
      .attr("class", "legend")
      .attr('id','legend')
      .attr("transform", `translate(${ padding.left + 100},${padding.top + baseHeight + 20})`);
    svg.select(".legend").call(colorLegend);
  svg.selectAll(".legend rect").attr('class','legend-item')


      svg
        .append("text")
         .attr('id','title')
  .text('Movie Stuff')
        .attr("x",width / 2 + padding.left )
  .style('text-anchor','middle')
        .attr("y", 30)
        .attr("font-size", "40px");

     svg
        .append("text")
    .attr('id','description')
        .text('100 Highest Grossing Movies By Genre')
        .style("text-anchor", "middle")
        .attr("x", width / 2 + padding.left)
        .attr("y", 60)
        .attr("font-size", "20px");
};

document.addEventListener("DOMContentLoaded", buildChart);
