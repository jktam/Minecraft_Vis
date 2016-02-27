// Calling the file my.js.
// Make sure you have already loaded the 
// d3 file and html elements 
// if you want to reference it here.

// set dimensions of the canvas / graph
// var margin = {top: 20, right: 20, bottom: 30, left: 50},
var margin = {top: 20, right: 20, bottom: 150, left: 40},
        width = 1024 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

// set the ranges
var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
var y = d3.scale.linear().range([height, 0]);

// define the axes
var xAxis = d3.svg.axis()
        .scale(x)
          .orient("bottom");
var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          // .ticks(10);
          .tickFormat(d3.format(".2s"));

// add the svg canvas to the div with id = barchart
var svg = d3.select("#barchart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("class", "barchart_svg")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.behavior.zoom().scaleExtent([1, 10]).on("zoom", zoom));
// this div is used for the tooltip
var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);
//alternative tip
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>"+d.meta+": </strong> <span style='color:steelblue'>" + d.total_count + "</span>";
  })

svg.call(tip);

var bars = svg.selectAll(".bar")

// Load the data, process it, and display it with a bar chart.
// You can't load the fullsize file, so you'll need to do some
// preprocessing to break the data up or aggregate it
d3.csv("data/parsedDataPak.csv", function(error, data) {
// d3.csv("data/VE_datapak_small.csv", function(error, data) {

  if (error) throw error;

  // get the total time spent on each key
  // var times = calc_time_per_key(data);
  var count = calc_count_per_meta(data);

  // scale the data ranges
  // the x domain goes over the set of meta
  x.domain(data.map(function(d) { return d.meta; }));
  // y goes from 0 to the max value in count
  y.domain([0, d3.max(count, function(d) { return d.total_count; })]);

  // add the axes
  svg.append("g")
      .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-90)" );
  svg.append("g")
      .attr("class", "y axis")
    .call(yAxis)
  .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Amount Crafted");

  // add the bars
  bars = svg.selectAll(".bar")
    .data(count)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.meta); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.total_count); })
      .attr("height", function(d) { return height - y(d.total_count); })
      // .on("mouseover", function(d) {
      //   div.transition()
      //     .duration(200)
      //     .style("opacity", .9);
      //   div.html(d.meta + " = " + d.total_count)
      //     .style("left", (x(d.meta) + x.rangeBand() + x.rangeBand()/2) + "px")
      //             .style("top", (d3.event.pageY - 28) + "px")
      //   })
      // .on("mouseout", function(d) {
      //   div.transition()    
      //             .duration(500)    
      //             .style("opacity", 0); 
      //   });
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
  console.log("done");
});

// this gets the total time spent on each key 
// from on the loaded file and adds
// it to a javascript object called count_per_meta.
function calc_count_per_meta(data) {
  var count_per_meta = {};
  for(var i = 0; i < data.length; i+=1)
  {
    var row = data[i];
    if(row.meta in count_per_meta)
    {
      count_per_meta[row.meta] += 1;
    }
    else
    {
      count_per_meta[row.meta] = 1;
    }
  }
  
  //convert to array form
  var count_per_meta_array = Object.keys(count_per_meta).map(function (meta) {
    return {
      "meta": meta, 
        "total_count": count_per_meta[meta]
    };
  });
  
  return count_per_meta_array;
}

//search chart of specified item
function setSearchItem() {
    var searchVal = document.getElementById("searchItem").value;
    console.log("current searchVal = " + searchVal)
    
}

function zoom() {
  bars.attr("transform", "translate(" + d3.event.translate[0]+",0)scale(" + d3.event.scale + ",1)");
    svg.select(".x.axis").attr("transform", "translate(" + d3.event.translate[0]+","+(height)+")")
        .call(xAxis.scale(x.rangeRoundBands([0, width * d3.event.scale],.1 * d3.event.scale)));
  svg.select(".y.axis").call(yAxis);
}