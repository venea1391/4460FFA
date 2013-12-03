/* The inspiration for this chart came from http://bl.ocks.org/mbostock/1283663. It was
heavily modified to accomodate the data, be color coordinated, and interact with 
other components on the page. */

function transitionVotesBarChart(transition_series, transition_season, transition_episode){
$('#barchart').empty();

/* Tooltip basic format found in an example, modified */
var tooltip = d3.select("#barchart")
	.append("div")
	.style("position", "absolute")
	.style("opacity", ".8")
	.style("z-index", "10")
	.style("visibility", "hidden")
	.style("background", "white")
	.style("font-size", "11px")
	.style("font-family", "sans-serif")
	.style("padding", "5px");

var m = [30, 40, 20, 120], // top right bottom left
    w = 600 - m[1] - m[3], // width
    h = 775 - m[0] - m[2], // height
    x = d3.scale.linear().range([0, w]),
    y = 10, // bar height
    z = d3.scale.ordinal().range(["steelblue", "#ccc"]), // bar color
    duration = 750,
    delay = 25;
    
//sets the values of all the nodes (episodes) to their rating
var hierarchy = d3.layout.partition()
	.sort(null) //disable sorting to keep existing order
    .value(function(d) { return d.numOfVotes; }); 

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("top");

var svg = d3.select("#barchart").append("svg:svg")
	.attr("id", "kateriVotes")
    .attr("width", w + m[1] + m[3]) //960
    .attr("height", 0) //h + m[0] + m[2])  //500
    .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

svg.append("svg:rect")
    .attr("class", "background")
    .attr("width", w)
    .attr("height", h);

svg.append("svg:g")
    .attr("class", "x axis");

svg.append("svg:g")
    .attr("class", "y axis")
  .append("svg:line")
    .attr("y1", "100%");
    
    
/* Basic hierarchy data borrowed from example, added a lot of computation to be able to 
start the chart at something other than the root of the hierarchy */
d3.json("data/hierarchy.json", function(root) {
  hierarchy.nodes(root);
  x.domain([0, (root.value)]).nice(); 
  var transition_node;
  var transition_index=0;
  var transition_episode_node;
  var TEN_index = 0;
  if (transition_series!="") { 
  	$(root.children).each(function(i, e){
  		if (getSeriesName(e.name)==transition_series){
  			transition_node = e;
  			transition_index = i;
  			if (transition_season!="")	{
  				$(e.children).each(function(i2, e2){
  					if (e2.name==transition_season){
  						transition_node = e2;
  						transition_node.parent.index = transition_index;
  						transition_index = i2;
  						if (transition_episode!="")	{
  							$(e2.children).each(function(i3, e3){
  								if (transition_episode.substring(0, 1)=='~') {
  									var numCheck = transition_episode.substring(1);
  									var h = parseInt(numCheck);
  									if (transition_series=="The Original Series" && transition_season=="Season 1"){
  										if (i3==h){
  											transition_episode_node = e3;
  											TEN_index = i3+1;
  										}
  									}
  									else {
  										if ((i3+1)==h){
  											transition_episode_node = e3;
  											TEN_index = i3+1;
  										}
  									}
  								}
  								else {
  									if (e3.name==transition_episode){
  										transition_episode_node = e3;
  										TEN_index = i3+1;
  									}
  								}
  							});
  						}
  					}
  				});
  			}
  			down(transition_node, transition_index);
  			if (transition_episode_node){
  				//get the bar
  				var array=(d3.selectAll("rect"));
  				var thing = array[0][TEN_index];
  				d3.select(thing).style("fill", function(){
  					return getEpisodeHighlightColor(transition_episode_node);
  				});
  				setInfoPaneText(transition_episode_node, 'episode');
  				setTitleText(transition_episode_node);
  			}
  		}
  	});
  }
  else {down(root, 0);}
});

/* A lot of custom code was added to this to have clicks modify the info pane. 
Transitions did not have to be modified because it was appropriate to aggregate votes. */
function down(d, i) {
  if (!d.children || this.__transition__) {
  	d3.selectAll(".enter").selectAll("rect").style("fill", colors[5]);
  	setInfoPaneText(d, 'episode');
  	setTitleText(d);
  	d3.select(this).select("rect").style("fill", function(d,i){
  		return getEpisodeHighlightColor(d);
  	});
  	return;
  }
  setTitleText(d);
  current_bar_node = d;
  var end = duration + d.children.length * delay;

  // Mark any currently-displayed bars as exiting.
  var exit = svg.selectAll(".enter").attr("class", "exit");

  // Entering nodes immediately obscure the clicked-on bar, FALSE so hide it.
  exit.selectAll("rect").filter(function(p) { return p === d; })
      .style("fill-opacity", 1e-6);

  // Enter the new bars for the clicked-on data.
  // Per above, entering bars are immediately visible.
  var enter = bar(d)
      .attr("transform", stack(i))
      .style("opacity", 1);

  // Have the text fade-in, even though the bars are visible.
  // Color the bars as parents; they will fade to children if appropriate.
  enter.select("text").style("fill-opacity", 1e-6);
  enter.select("rect").style("fill", function(d,i){
  	return getColor(d, i);
  });

  // Update the x-scale domain.
  x.domain([0, d3.max(d.children, function(d) { return d.value; })]).nice(); 

  // Update the x-axis.
  svg.selectAll(".x.axis").transition().duration(duration).call(xAxis);
  d3.select('#kateriVotes').transition().duration(duration).attr("height", 35+y*d.children.length*1.2);

  // Transition entering bars to their new position.
  var enterTransition = enter.transition()
      .duration(duration)
      .delay(function(d, i) { return i * delay; })
      .attr("transform", function(d, i) { return "translate(0," + y * i * 1.2 + ")"; });

  // Transition entering text.
  enterTransition.select("text").style("fill-opacity", 1);

  // Transition entering rects to the new x-scale.
  enterTransition.select("rect")
      .attr("width", function(d) { return x(d.value); });

  // Transition exiting bars to fade out.
  var exitTransition = exit.transition()
      .duration(duration)
      .style("opacity", 1e-6)
      .remove();

  // Transition exiting bars to the new x-scale.
  exitTransition.selectAll("rect").attr("width", function(d) { return x(d.value); });

  // Rebind the current node to the background.
  svg.select(".background").data([d]).transition().duration(end); d.index = i;
  
  /*if (!d.parent){
  	svg.select(".background").style("cursor", "default");
  }
  else {svg.select(".background").style("cursor", "pointer");}*/
  
  if (!d.children[0].children) {
  	setInfoPaneText(d, 'season');
  	return;
  }
  if (!d.children[0].children[0].children){
  	setInfoPaneText(d, 'series');
  	return;
  }

}

/* Similar to down() */
function up(d) {
  if (!d.parent || this.__transition__) return;
  setTitleText(d.parent);
  current_bar_node = d;
  var end = duration + d.children.length * delay;

  // Mark any currently-displayed bars as exiting.
  var exit = svg.selectAll(".enter").attr("class", "exit");

  // Enter the new bars for the clicked-on data's parent.
  var enter = bar(d.parent)
      .attr("transform", function(d, i) { return "translate(0," + y * i * 1.2 + ")"; })
      .style("opacity", 1e-6);

  // Color the bars as appropriate.
  // Exiting nodes will obscure the parent bar, so hide it.
  enter.select("rect")
      .style("fill", function(d,i){return getColor(d, i);})
      .filter(function(p) { return p === d; })
      .style("fill-opacity", 1e-6);

  // Update the x-scale domain.
  x.domain([0, d3.max(d.parent.children, function(d) { return d.value; })]).nice();

  // Update the x-axis.
  svg.selectAll(".x.axis").transition().duration(duration).call(xAxis);

  // Transition entering bars to fade in over the full duration.
  var enterTransition = enter.transition()
      .duration(end)
      .style("opacity", 1);

  // Transition entering rects to the new x-scale.
  // When the entering parent rect is done, make it visible!
  enterTransition.select("rect")
      .attr("width", function(d) { return x(d.value); })
      .each("end", function(p) { if (p === d) d3.select(this).style("fill-opacity", null); });

  // Transition exiting bars to the parent's position.
  var exitTransition = exit.selectAll("g").transition()
      .duration(duration)
      .delay(function(d, i) { return i * delay; })
      .attr("transform", stack(d.index));

  // Transition exiting text to fade out.
  exitTransition.select("text")
      .style("fill-opacity", 1e-6);

  // Transition exiting rects to the new scale and fade to parent color.
  exitTransition.select("rect")
      .attr("width", function(d) { return x(d.value); })
      .style("fill", function(d,i){return getColor(d, i);});

  // Remove exiting nodes when the last child has finished transitioning.
  exit.transition().duration(end).remove();
  
  d3.select('#kateriVotes').transition().duration(duration).attr("height", 35+y*d.parent.children.length*1.2);

  // Rebind the current parent to the background.
  svg.select(".background").data([d.parent]).transition().duration(end);

  /*if (!d.parent.parent){
  	svg.select(".background").style("cursor", "default");
  }
  else {svg.select(".background").style("cursor", "pointer");}*/
}

// Creates a set of bars for the given data node, at the specified index.
function bar(d) {
  var bar = svg.insert("svg:g", ".y.axis")
      .attr("class", "enter")
      .attr("transform", "translate(0,5)")
      .selectAll("g")
      .data(d.children)
      .enter().append("svg:g")
      .style("cursor", "pointer")
      .on("click", down) //drill down onclick
      .on("mouseover", function(d){setTooltipText(d); })
	  .on("mousemove", function(){
		return tooltip.style("top", (d3.event.pageY)+"px").style("left",(d3.event.pageX+20)+"px");})
	  .on("mouseout", function(){
    	return tooltip.style("visibility", "hidden");});

  bar.append("svg:text")
      .attr("x", -6)
      .attr("y", y / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text(function(d) { 
      			if (!d.children) return 'Episode '+d.epNum;
      			else return d.name; });

  bar.append("svg:rect")
      .attr("width", function(d) { return x(d.value); }) //width of bar is x * the bar's value
      .attr("height", y);

  return bar;
}


/* Completely from scratch */
function setTooltipText(node){
	var n, sn;
	if (node.children && node.children[0].children && node.children[0].children[0].children) {
		return;
	}
	else if (node.children && node.children[0].children) {
		//series
		n = getSeriesName(node.name);
		var seasons = node.children.length;
		tooltip.html(n + "<br />Seasons: " + seasons + "<br />Number of Votes: " + node.value);
	}
	else if (node.children) {
		//season
		sn = getSeriesName(node.parent.name);
		var episodes = node.children.length;
		n = node.name;
		tooltip.html(sn + "<br />" + n + "<br />" + episodes + " episodes" + "<br />Number of Votes: " + node.value);
	}
	else {
		//episode
		sn = getSeriesName(node.parent.parent.name);
		n = node.name;
		var epNum = node.epNum;
		averageRating = node.value;
		seasonn = node.parent.name;
		tooltip.html(sn + "<br />" + seasonn + " Episode " + epNum + "<br />" + n + "<br />Number of Votes: " + node.value);
	}
    return tooltip.style("visibility", "visible");
}

// A stateful closure for stacking bars horizontally. Was not modified.
function stack(i) {
  var x0 = 0;
  return function(d) {
    var tx = "translate(" + x0 + "," + y * i * 1.2 + ")";
    x0 += x(d.value);
    return tx;
  };
}

$('#moveUpBars').click(function(){up(d3.select(".background").data()[0])});
}
