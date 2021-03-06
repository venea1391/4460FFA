var tooltip;

var abbrFull = {"TOS":"The Original Series","TNG":"The Next Generation", "DS9":"Deep Space Nine","VOY":"Voyager","ENT":"Enterprise"};
var seriesTrick = {"TOS":0,"TNG":1,"DS9":2,"VOY":3,"ENT":4};

var m = [50, 50, 50, 40], // top right bottom left
    w = 700 - m[1] - m[3], // width
    h = 500 - m[0] - m[2]; // height

var margin = [10, 60, 30, 13],
    width = 700 - margin[1] - margin[3],
    height;

var x = d3.scale.ordinal().rangePoints([0, w], 1);
    y = {},
    duration = 750,
    delay = 100;

var line = d3.svg.line(),
	area = d3.svg.area(),
    axis = d3.svg.axis().orient("left"),
    background,
    foreground,
    series,
    g;

var legend,
	sublegend,
	svg;

var overallData;

// json loading code from barchart.js
d3.json("data/hierarchy.json", function(d) {
	assignAvgValue(d);
	overallData = d;
	// console.log(dimensions);
	series = getSeries(d);

	// setup tooptip
	tooltip = d3.select("#linechart")
	.append("div")
	.style("position", "absolute")
	.style("opacity", ".8")
	.style("z-index", "10")
	.style("visibility", "hidden")
	.style("background", "white")
	.style("font-size", "11px")
	.style("font-family", "sans-serif")
	.style("padding", "5px");

	//back navigation
	$("#startrek_mc").click(function(){
		if ($(this).css("cursor") != "normal"){
			deleteSVG();
			setTitleTextMC('', '');
			seasonLevel(overallData);
			changeBarChartFocus("","","");
		}
	});

	seasonLevel(d);
});

// top-level visualization
function seasonLevel(d){
	// set axis
    axis = d3.svg.axis().orient("left");

    // x axis domain
	x.domain(dimensions=longestSeasons(d));
	for (var i = 0; i<dimensions.length; i++){
		y[dimensions[i]] = d3.scale.linear().domain([6, 9]).range([h, 0]);
	}
	var lineData = seasonsInAllSeries();
	//svg
	svg = d3.select("#linechart").append("svg:svg")
		.attr("class","mc")
	    .attr("width", w + m[1] + m[3]) //960
	    .attr("height", h + m[0] + m[2])  //500
		.append("svg:g")
	    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

	// legend
	legend = svg.selectAll("g.legend")
	  .data(series)
	  .enter().append("svg:g")
	  .attr("class", "legend")
	  .attr("transform", function(s, i) { return "translate("+w+"," + (i * 20 + 150) + ")"; });

	legend.append("svg:line")
	  .attr("class", String)
	  .attr("x1", -7)
	  .attr("x2", 8)
	  .attr("stroke-width", 2);

	legend.append("svg:text")
	  .attr("x", 12)
	  .attr("dy", ".31em")
	  .text(function(s) { return s; })
	  .on("click",seriesNo);

	// displayed path
	foreground = svg.append("svg:g")
	  .attr("class", "foreground")
	  .selectAll("path")
	  .data(series)
	  .enter().append("svg:path")
	  .attr("d", flatPath)
	  .attr("class",function(s){return s})
	  .style("opacity", 0);

	// path enter animation
	foreground.transition()
      .duration(duration)
      // .delay(duration/2)
      .style("opacity", 1)
      .attr("d", path);

    // dimension position
	g = svg.selectAll(".dimension")
	  .data(dimensions)
	  .enter().append("svg:g")
	  .attr("class", "dimension")
	  .attr("transform", function(d) {return "translate(" + x(d) + ")"; })
	  .style("opacity",1);

	// Add an axis and title.
	g.append("svg:g")
	  .attr("class", "axis")
	  .each(function(s) {d3.select(this).call(axis.scale(y[s]).ticks(4)); })
	  .append("svg:text")
	  .attr("class","axisPointer")
	  .attr("text-anchor", "middle")
	  .attr("x",-10)
	  .attr("y", h+20)
	  .text(String)
	  .on("click",seasonNumber);//function(){exit();});

	// Circle
	circleData = generateYAxisData();

	var circle = svg.append("svg:g")
		.attr("class", "circles")
		.selectAll("g.circle")
		.data(circleData)
		.enter().append("svg:circle")
		.attr("cx",function(s){var tmp = "Season "+(parseInt(s.substring(4))+1);return x(tmp)})
		.attr("cy",function(s){var tmp = "Season "+(parseInt(s.substring(4))+1);return y[tmp](d.children[series.indexOf(s.substring(0,3))].children[s.substring(4)].value)})
		.attr("r",3)
		.style("opacity",0)
		.style("fill","rgb(214,214,214)")
		.style("stroke","rgb(50,50,50)")
		.on("mouseover", function(s){ setTooltipText(s); })
		.on("mousemove", function(){ return tooltip.style("top", (d3.event.pageY)+"px").style("left",(d3.event.pageX+20)+"px"); })
		.on("mouseout", function(){ return tooltip.style("visibility", "hidden"); })
		.on("click", function(c){setIPText(c); });

	// Circle animation
	circle.transition()
		.duration(duration)
		.delay(duration/2)
		.style("opacity",1);

	// Set tooltip text
	function setTooltipText(s){
		var srs = s.substring(0,3);
		var sea = parseInt(s.substring(4));
		tooltip.html(abbrFull[srs]+"<br />Season "+(sea+1)+"<br /> Average Rating: "+parseFloat(d.children[seriesTrick[srs]].children[sea].value).toFixed(1));
		return tooltip.style("visibility", "visible");
	}
	
	// Set Info Pane text
	function setIPText(c){
		var srs = c.substring(0,3);
		var sea = parseInt(c.substring(4));
		setInfoPaneText(d.children[seriesTrick[srs]].children[sea], "season");
		changeBarChartFocus(getSeriesName(srs),"Season "+(sea+1),"");
	}
	
	// Get all seasons in 
	function seasonsInAllSeries(){
		var toReturn = {};
		for (var i = 0; i < d.children.length; i++) {
			var tmp = []
			for (var j=0; j < d.children[i].children.length; j++){
				tmp.push("Season "+(j+1));
			}
			toReturn[d.children[i].name] = tmp;
		};
		return toReturn;
	}

	// Generate y axis data
	function generateYAxisData(){
		var result = [];
		for (var i = 0; i < series.length; i++) {
			// var tmp = [];
			for (var j=0; j< d.children[i].children.length;j++){
				// console.log(seriesForSeason[i] + "_" + x[seriesForSeason[i]].domain()[j]);
				result.push(series[i] + "_" + j);
			}
			// result[series[i]] = tmp;
		}
		// console.log(result["VOY"]);
		return result;
	}

	// Generate rating path
	function path(s) {
		return line(lineData[s].map(function(p) {
			// console.log(y[p](getScore(d,s,p)));
			return [x(p), y[p](getScore(d,s,p))];
		}));
	}

	// Go to particular season
	function seasonNumber(tmp,i){
		// exit();
		deleteSVG();
		setTitleTextMC('', tmp);
		setInfoPaneTextForSeason(i+1, seriesHasSeason(d,i), d);
		episodeLevel(d,i);
	}

	// Go to particular Series
	function seriesNo(tmp,i){
		// exit();
		changeBarChartFocus(getSeriesName(tmp),"","");
		deleteSVG();
		setTitleTextMC(getSeriesName(tmp), '');
		setInfoPaneText(d.children[i], "series");
		seriesLevel(d,series[i]);
	}
}

// Particular Season
function episodeLevel(d,season){
	//get all series has that season number
	var seriesForSeason = seriesHasSeason(d,season);
	height = (500/seriesForSeason.length) - margin[0] - margin[2];
	// domain for x axis and y axis
	for (var i = 0; i < seriesForSeason.length; i++) {
		x[seriesForSeason[i]] = d3.scale.ordinal().rangePoints([0, width], 1).domain(episodesInSeriesSeason(d,seriesForSeason[i],season));
		y[seriesForSeason[i]] = d3.scale.linear().range([height, 0]).domain(seriesSeasonMaxMin(d,seriesForSeason[i],season));
	}
	var xx = d3.scale.ordinal().rangePoints([0, width], 1).domain(longestEpisodes(d,season));
	var yy = d3.scale.linear().range([height, 0]).domain(seasonMaxMin(d,season));

	// svg
	svg = d3.select("#linechart").selectAll("svg")
		.data(seriesForSeason)
		.enter().append("svg:svg")
		.attr("class","mc")
	    .attr("width", width + margin[1] + margin[3]) //960
	    .attr("height", height + margin[0] + margin[2])  //69
		.append("svg:g")
		.attr("class","foreground")
	    .attr("transform", "translate(" + margin[3] + "," + margin[0] + ")");

	// legend
	svg.append("svg:g")
		.attr("class","legend")
		.attr("transform", function(s,i){return "translate("+(width+5)+",0)";})
		.append("svg:text")
		.attr("x",10)
		.attr("dy", ".31em")
		.text(String)
		.on("click",seriesNo);

	// y-axis
	svg.append("svg:g")
		// .attr("transform", function(s){ var tmp = x[s].domain().length > 29? x[s].domain().length-1:x[s].domain().length; return "translate("+ x[s](tmp) +")";})
		// .attr("transform",function(s){var tmp = (s=="TOS"&&season==0)? x[s].domain().length-1:x[s].domain().length; return "translate("+ xx(tmp) +")";})
		.attr("transform",function(s){var tmp = (season==0)? 0:1; return "translate("+ xx(tmp) +")";})
		.attr("class","axis")
		// .each(function(s){d3.select(this).call(axis.scale(y[s]).tickValues(y[s].domain()).orient("right"));})
		// .each(function(s){d3.select(this).call(axis.scale(yy).tickValues(yy.domain()).orient("right"));})
		.each(function(s){d3.select(this).call(axis.scale(yy).tickValues(yy.domain()).orient("left"));})
		.append("svg:text")
		.attr("text-anchor", "middle")
		.attr("x",-10)
		.attr("y", h+20)
		.attr("class","no-pointer")
		.text(String);

	// x-axis
	svg.append("svg:g")
		.attr("transform", function(s){return "translate(0,"+height+")"})
		.attr("class","xaxis")
		.style("display","none")
		// .each(function(s){d3.select(this).call(axis.scale(x[s]).tickValues(x[s].domain()).orient("bottom"));});
		.each(function(s){d3.select(this).call(axis.scale(xx).tickValues(xx.domain()).orient("bottom"));});

	// only show the last child
	xaxis = d3.selectAll('.xaxis');
	xaxis[0][xaxis[0].length - 1].style.display = "inline";

	// create grid line
	svg.selectAll("g.gridLine")
		.data(xx.domain())
		.enter().append("svg:line")
		.attr("class",function(s){return "gridline grid"+s})
		.attr("x1",function(s){return xx(s)})
		.attr("y1",0)
		.attr("x2",function(s){return xx(s)})
		.attr("y2",height + margin[0] + margin[2])
		.style("display","none");

	// svg.append("svg:line")
	// 	.attr("class","axis")
	// 	// .attr("x1",function(s){return x[s](x[s].domain()[0])})
	// 	.attr("x1",function(s){return xx(xx.domain()[0])})
	// 	.attr("y1",height)
	// 	// .attr("x2",function(s){return x[s](x[s].domain()[x[s].domain().length - 1])})
	// 	.attr("x2",function(s){return xx(xx.domain()[xx.domain().length - 1])})
	// 	.attr("y2",height)
	// 	.style("stroke","black")
	// 	.style("stroke-width",1)
	// 	.style("opacity",1)
	// 	.style("shape-rendering","crispedges");


	// Add the line path elements. Note: the y-domain is set per element.
	var ratePath = svg.append("svg:path")
		.attr("class",function(s){return s;})
		.style("opacity", 0.5)
		.attr("d", flatPath);

	ratePath.transition()
		.duration(duration)
		.style("opacity", 1)
		.attr("d", path);

	// Circle
	yAxisData = generateYAxisData();

	yAxis = svg.selectAll("g.yAxis")
		.data(function(s){return yAxisData[s]})
		.enter().append("svg:circle")
		// .attr("cx",function(s){return x[s.substring(0,3)](s.substring(4))})
		.attr("cx",function(s){return xx(s.substring(4))})
		// .attr("cy",function(s){return y[s.substring(0,3)](getEpisodeScore(d,s.substring(0,3),season,s.substring(4)))})
		.attr("cy",function(s){return yy(getEpisodeScore(d,s.substring(0,3),season,s.substring(4)))})
		.attr("r",function(s){
			var score = getEpisodeScore(d,s.substring(0,3),season,s.substring(4));
			var minmax = seriesSeasonMaxMin(d,s.substring(0,3),season);
			//console.log('score: '+score+' minmax: '+minmax+' s: '+s);
			if (score==minmax[0]){
				return 4;
			}
			else if (score==minmax[1]){
				return 5;
			}
			else return 3;})
		.style("opacity",0)
		.style("fill", function(s){
			var score = getEpisodeScore(d,s.substring(0,3),season,s.substring(4));
			var minmax = seriesSeasonMaxMin(d,s.substring(0,3),season);
			//console.log('score: '+score+' minmax: '+minmax+' s: '+s);
			if (score==minmax[0]){
				return "black";
			}
			else if (score==minmax[1]){
				return "white";
			}
			else return "rgb(214,214,214)";})
		.style("stroke","rgb(50,50,50)")
		.on("mouseover", function(s){ setTooltipText(s); showGridLine(s);})
		.on("mousemove", function(){ return tooltip.style("top", (d3.event.pageY)+"px").style("left",(d3.event.pageX+20)+"px"); })
		.on("mouseout", function(){d3.selectAll(".gridline").style("display","none"); return tooltip.style("visibility", "hidden"); })
		.on("click", function(c){setIPText(c);});

	yAxis.transition()
		.duration(duration)
		.delay(duration/2)
		.style("opacity",1);


	// Show Grid Line
	function showGridLine(s){
		var epi = parseInt(s.substring(4));
		var selectorText = ".grid"+epi;
		d3.selectAll(selectorText).style("display","inline");
	}

	// Set tooptip text
	function setTooltipText(s){
		var srs = s.substring(0,3);
		var epi = parseInt(s.substring(4));
		var calculatedEpi = (srs == "TOS" && season == 0)?epi:(epi-1);
		tooltip.html("Season "+(season+1)+" Episode "+epi+"<br />"+d.children[seriesTrick[srs]].children[season].children[calculatedEpi].name+"<br />Average Rating: "+parseFloat(d.children[seriesTrick[srs]].children[season].children[calculatedEpi].value).toFixed(1));
		return tooltip.style("visibility", "visible");
	}

	// Set Info Pane
	function setIPText(c){
		var srs = c.substring(0,3);
		var epi = parseInt(c.substring(4));
		var calculatedEpi = (srs == "TOS" && season == 0)?epi:(epi-1);
		setInfoPaneText(d.children[seriesTrick[srs]].children[season].children[calculatedEpi], "episode");
		changeBarChartFocus(getSeriesName(srs),"Season "+(season+1),d.children[seriesTrick[srs]].children[season].children[calculatedEpi].name);
	}
	
	// Set rating path
	function path(s) {
		return line(x[s].domain().map(function(p) {
			// console.log(s,p);
			// console.log(y[p](getScore(d,s,p)));
			// return [x[s](p), y[s](getEpisodeScore(d,s,season,p))];
			return [xx(p), yy(getEpisodeScore(d,s,season,p))];
		}));
	}

	// Set 0 height path
	function flatPath(s){
		return line(x[s].domain().map(function(p) {
			// return [x[s](p), height];
			return [xx(p), height];
		}));
	}

	// Generate Y axis data
	function generateYAxisData(){
		var result = {};
		for (var i = 0; i < seriesForSeason.length; i++) {
			var tmp = [];
			for (var j=0; j< x[seriesForSeason[i]].domain().length;j++){
				// console.log(seriesForSeason[i] + "_" + x[seriesForSeason[i]].domain()[j]);
				tmp.push(seriesForSeason[i] + "_" + x[seriesForSeason[i]].domain()[j]);
			}
			result[seriesForSeason[i]] = tmp;
		}
		// console.log(result["VOY"]);
		return result;
	}

	// Go to Series Level
	function seriesNo(tmp,i){
		// exit();
		changeBarChartFocus(getSeriesName(tmp),"","");
		deleteSVG();
		setTitleTextMC(getSeriesName(tmp), '');
		setInfoPaneText(d.children[i], "series");
		seriesLevel(d,seriesForSeason[i]);
	}
}

// Series Level
function seriesLevel(d,seriesAbr){
	// get all series has that season number
	var seasonForSeries = seasonInSeries(d,seriesAbr);
	height = (500/seasonForSeries.length) - margin[0] - margin[2];
	//domain for x and y
	for (var i = 0; i < seasonForSeries.length; i++) {
		x[seasonForSeries[i]] = d3.scale.ordinal().rangePoints([0, width], 1).domain(episodesInSeriesSeason(d,seriesAbr,i));
		y[seasonForSeries[i]] = d3.scale.linear().range([height, 0]).domain(seriesSeasonMaxMin(d,seriesAbr,i));
	}
	var xx = d3.scale.ordinal().rangePoints([0, width], 1).domain(longestEpisodesInSeries(d,seriesAbr));
	var yy = d3.scale.linear().range([height, 0]).domain(seariesMaxMin(d,seriesAbr));

	// svg
	svg = d3.select("#linechart").selectAll("svg")
		.data(seasonForSeries)
		.enter().append("svg:svg")
		.attr("class","mc")
	    .attr("width", width + margin[1] + margin[3]) //960
	    .attr("height", height + margin[0] + margin[2])  //69
		.append("svg:g")
		.attr("class","foreground")
	    .attr("transform", "translate(" + margin[3] + "," + margin[0] + ")");

	// legend
	svg.append("svg:g")
		.attr("class","legend")
		.attr("transform", function(){return "translate("+(width+5)+",0)";})
		.append("svg:text")
		.attr("x",10)
		.attr("dy", ".31em")
		.text(function(s){return "Season "+(s+1)})
		.on("click",seasonNumber);

	// y-axis
	svg.append("svg:g")
		// .attr("transform", function(s){ var tmp = x[s].domain().length > 29? x[s].domain().length-1:x[s].domain().length; return "translate("+ x[s](tmp) +")";})
		// .attr("transform",function(s){var tmp = (x[s].domain().length > 29)? x[s].domain().length-1:x[s].domain().length; return "translate("+ xx(tmp) +")";})
		.attr("transform",function(s){var tmp = (seriesAbr=="TOS")? 0:1; return "translate("+ xx(tmp) +")";})
		.attr("class","axis")
		// .each(function(s){d3.select(this).call(axis.scale(y[s]).tickValues(y[s].domain()).orient("right"));})
		// .each(function(s){d3.select(this).call(axis.scale(yy).tickValues(yy.domain()).orient("right"));})
		.each(function(s){d3.select(this).call(axis.scale(yy).tickValues(yy.domain()).orient("left"));})
		.append("svg:text")
		.attr("text-anchor", "middle")
		.attr("x",-10)
		.attr("y", h+20)
		.attr("class","no-pointer")
		.text(String);

	// x-axis
	svg.append("svg:g")
		.attr("transform", function(s){return "translate(0,"+height+")"})
		.attr("class","xaxis")
		.style("display","none")
		// .each(function(s){d3.select(this).call(axis.scale(x[s]).tickValues(x[s].domain()).orient("bottom"));});
		.each(function(s){d3.select(this).call(axis.scale(xx).tickValues(xx.domain()).orient("bottom"));});

	// only show the last child
	xaxis = d3.selectAll('.xaxis');
	xaxis[0][xaxis[0].length - 1].style.display = "inline";

	// create grid line
	svg.selectAll("g.gridLine")
		.data(xx.domain())
		.enter().append("svg:line")
		.attr("class",function(s){return "gridline grid"+s})
		.attr("x1",function(s){return xx(s)})
		.attr("y1",0)
		.attr("x2",function(s){return xx(s)})
		.attr("y2",height + margin[0] + margin[2])
		.style("display","none");
	// svg.append("svg:line")
	// 	.attr("class","axis")
	// 	// .attr("x1",function(s){return x[s](x[s].domain()[0])})
	// 	.attr("x1",function(s){return xx(xx.domain()[0])})
	// 	.attr("y1",height)
	// 	// .attr("x2",function(s){return x[s](x[s].domain()[x[s].domain().length - 1])})
	// 	.attr("x2",function(s){return xx(xx.domain()[xx.domain().length - 1])})
	// 	.attr("y2",height)
	// 	.style("stroke","black")
	// 	.style("stroke-width",1)
	// 	.style("opacity",1)
	// 	.style("shape-rendering","crispedges");

	// Add the line path elements. Note: the y-domain is set per element.
	var ratePath = svg.append("svg:path")
		.attr("class", seriesAbr)
		.style("opacity", 0.5)
		.attr("d", flatPath);

	ratePath.transition()
		.duration(duration)
		.style("opacity", 1)
		.attr("d", path);

	// Circle
	yAxisData = generateYAxisData();

	yAxis = svg.selectAll("g.yAxis")
		.data(function(s){return yAxisData[s]})
		.enter().append("svg:circle")
		// .attr("cx",function(s){return x[s.substring(0,s.indexOf("_"))](s.substring(s.indexOf("_")+1))})
		.attr("cx",function(s){var tmp = ((seriesAbr == "TOS") && (s.substring(s.indexOf("_")) == "0"))? s.substring(s.indexOf("_")) : s.substring(s.indexOf("_")+1); return xx(tmp);})
		// .attr("cy",function(s){return y[s.substring(0,s.indexOf("_"))](getEpisodeScore(d,seriesAbr,s.substring(0,s.indexOf("_")),s.substring(s.indexOf("_")+1)))})
		.attr("cy",function(s){return yy(getEpisodeScore(d,seriesAbr,s.substring(0,s.indexOf("_")),s.substring(s.indexOf("_")+1)))})
		.attr("r",function(s){
			var score = getEpisodeScore(d,seriesAbr,s.substring(0,s.indexOf("_")),s.substring(s.indexOf("_")+1));
			var minmax = seriesSeasonMaxMin(d,seriesAbr,s.substring(0,s.indexOf("_")));
			//console.log('score: '+score+' minmax: '+minmax+' s: '+s);
			if (score==minmax[0]){
				return 4;
			}
			else if (score==minmax[1]){
				return 5;
			}
			else return 3;})
		.style("opacity",0)
		.style("fill", function(s){
			var score = getEpisodeScore(d,seriesAbr,s.substring(0,s.indexOf("_")),s.substring(s.indexOf("_")+1));
			var minmax = seriesSeasonMaxMin(d,seriesAbr,s.substring(0,s.indexOf("_")));
			//console.log('score: '+score+' minmax: '+minmax+' s: '+s);
			if (score==minmax[0]){
				return "black";
			}
			else if (score==minmax[1]){
				return "white";
			}
			else return "rgb(214,214,214)";})
		.style("stroke","rgb(50,50,50)")
		.on("mouseover", function(s){ setTooltipText(s); showGridLine(s);})
		.on("mousemove", function(){ return tooltip.style("top", (d3.event.pageY)+"px").style("left",(d3.event.pageX+20)+"px"); })
		.on("mouseout", function(){d3.selectAll(".gridline").style("display","none"); return tooltip.style("visibility", "hidden"); })
		.on("click", function(c){setIPText(c);});

	yAxis.transition()
		.duration(duration)
		.delay(duration/2)
		.style("opacity",1);
		
	mysvg = d3.select("#linechart").selectAll("svg").selectAll("circle");

	// Show Grid Line
	function showGridLine(s){
		var epi = parseInt(s.substring(s.indexOf("_")+1));
		var selectorText = ".grid"+epi;
		d3.selectAll(selectorText).style("display","inline");
	}

	// Set tooltip
	function setTooltipText(s){
		var season = parseInt(s.substring(0,s.indexOf("_")));
		var epi = parseInt(s.substring(s.indexOf("_")+1));
		var calculatedEpi = (seriesAbr == "TOS" && season == 0)?epi:(epi-1);
		tooltip.html("Season "+(season+1)+" Episode "+epi+"<br />"+d.children[seriesTrick[seriesAbr]].children[season].children[calculatedEpi].name+"<br />Average Rating: "+parseFloat(d.children[seriesTrick[seriesAbr]].children[season].children[calculatedEpi].value).toFixed(1));
		return tooltip.style("visibility", "visible");
	}

	// Set Info Pane Text
	function setIPText(c){
		var season = parseInt(c.substring(0,c.indexOf("_")));
		var epi = parseInt(c.substring(c.indexOf("_")+1));
		var calculatedEpi = (seriesAbr == "TOS" && season == 0)?epi:(epi-1);
		setInfoPaneText(d.children[seriesTrick[seriesAbr]].children[season].children[calculatedEpi], "episode");
		changeBarChartFocus(getSeriesName(seriesAbr),"Season "+(season+1),d.children[seriesTrick[seriesAbr]].children[season].children[calculatedEpi].name);
	}
	
	// Set rating path
	function path(s) {
		return line(x[s].domain().map(function(p) {
			// console.log(s,p);
			// console.log(y[p](getScore(d,s,p)));
			// return [x[s](p), y[s](getEpisodeScore(d,seriesAbr,s,p))];
			return [xx(p), yy(getEpisodeScore(d,seriesAbr,s,p))];
		}));
	}

	// 0 height path for animation
	function flatPath(s){
		return line(x[s].domain().map(function(p) {
			// return [x[s](p), height];
			return [xx(p), height];
		}));
	}

	// Y axis data for circle
	function generateYAxisData(){
		var result = {};
		for (var i = 0; i < seasonForSeries.length; i++) {
			var tmp = [];
			for (var j=0; j< x[seasonForSeries[i]].domain().length;j++){
				// console.log(seriesForSeason[i] + "_" + x[seriesForSeason[i]].domain()[j]);
				tmp.push(seasonForSeries[i] + "_" + x[seasonForSeries[i]].domain()[j]);
			}
			result[seasonForSeries[i]] = tmp;
		}
		// console.log(result["VOY"]);
		return result;
	}

	// Go to particular season level
    function seasonNumber(tmp,i){
		// exit();
		deleteSVG();
		setTitleTextMC('', 'Season '+(tmp+1));
		setInfoPaneTextForSeason(i+1, seriesHasSeason(d,i), d);
		episodeLevel(d,i);
	}
}
// Get seasons in a particular series
function seasonInSeries(d, seriesAbr){
	var sis = [];
	for (var i = 0; i < d.children.length; i++) {
		if (d.children[i].name == seriesAbr){
			for (var j = 0; j < d.children[i].children.length; j++) {
				sis.push(j);
			};
			break;
		}
	};
	return sis;
}
// Get all series has particular season
function seriesHasSeason(d,season){
	var shs = [];
	for (var i = 0; i < d.children.length; i++) {
		if(d.children[i].children.length > season){
			shs.push(d.children[i].name);
		} 
	}
	return shs;
}
// Get max and min for particular series and season
function seriesSeasonMaxMin(d,series,season){
	var mi=10, ma = 0;
	var i;
	for (i = 0; i < d.children.length; i++) {
		if (d.children[i].name == series){
			break;
		}
	};
	for (var j = 0; j < d.children[i].children[season].children.length; j++) {
		var rate = d.children[i].children[season].children[j].rating;
		if(mi>rate){
			mi = rate;
		}
		if(ma<rate){
			ma = rate;
		}
	};
	var result = [mi,ma];
	return result;
}

// Get max and min for particular season
function seasonMaxMin(d,season){
	var mi=10, ma = 0;
	for (var i = 0; i < d.children.length; i++){
		if(d.children[i].children.length > season){
			for (var j = 0; j < d.children[i].children[season].children.length; j++){
				var rate = d.children[i].children[season].children[j].rating;
				if(mi>rate){
					mi = rate;
				}
				if(ma<rate){
					ma = rate;
				}
			}
		}
	}
	var result = [mi,ma];
	return result;
}

// Get max and min for particular searies
function seariesMaxMin(d,seriesAbr){
	var mi=10, ma = 0;
	for (var i = 0; i < d.children.length; i++) {
		if (d.children[i].name == seriesAbr){
			for (var j = 0; j < d.children[i].children.length; j++){
				for (var k = 0; k < d.children[i].children[j].children.length; k++){
					var rate = d.children[i].children[j].children[k].rating;
					if(mi>rate){
						mi = rate;
					}
					if(ma<rate){
						ma = rate;
					}
				}
			}
		}
	};
	var result = [mi,ma];
	return result
}
// delete svg
function deleteSVG(){
	d3.selectAll(".mc").remove();
}


// decarprated
// function exit(){
// 	// path exit transition
// 	foreground.transition()
//       .duration(duration)
//       .style("opacity", 0);
//     // axis transition
//     g.transition()
//       .duration(duration)
//       .delay(duration/2)
//       .attr("transform", function() {return "translate(" + m[3] + ")"; })
//       .style("opacity",0);
//     //remove elements
//     svg.selectAll(".dimension").remove();
//     svg.selectAll(".foreground").remove();
//     svg.selectAll(".sublegend").remove();
//     svg.selectAll(".legend").remove();
// }

// 0 height path for animation top level
function flatPath(){
	return line(dimensions.map(function(p){
		return [x(p),400];
	}));
}
// Get score for particular series&season
function getScore(d,s,p){
	//assume d is root
	for (var i = 0; i < d.children.length; i++) {
		if (d.children[i].name == s){
			// console.log(d.children[i].name,s);
			for (var j = 0; j < d.children[i].children.length; j++) {
				// console.log(d.children[i].children[j].name,p);
				if (d.children[i].children[j].name == p){
					// console.log(d.children[i].children[j].value);
					return d.children[i].children[j].value;
					break;
				}
			}
		}
	}
	// return 0;
}
// Get particular episode score
function getEpisodeScore(d,s,season,p){
	// if (p==0 && s=="TOS"){
	// 	return d.children[0].children[season].children[0].value;
	// }
	for (var i = 0; i < d.children.length; i++) {
		if (d.children[i].name == s){
			// console.log(d.children[i].children.length, season);
			if (d.children[i].children.length > season){
				// console.log(d.children[i].children[season].children[j].value);
				var j = ((s=="TOS" && season == 0)?p:p-1);
				if (d.children[i].children[season].children.length > j){
					return d.children[i].children[season].children[j].value;
					break;
				}
			}
		}
	}
}
// get all series
function getSeries(d){
	// assume d is root
	var s = [];
	for (var i = 0; i < d.children.length; i++) {
		s.push(d.children[i].name);
	}
	return s;
}
// get all seasons in a series
function seasonsInSeries(d,seriesNumber){
	// assume d is root
	var result = [];
	for (var i = 0; i < d.children[seriesNumber].children.length; i++) {
		result.push(i); //d.children[seriesNumber].children[i].name
	}
	return result;
}
// get longest seasons
function longestSeasons(d){
	// assume d is root
	var maxLength = -1,index = -1;
	var result = [];
	for (var i=0; i<d.children.length;i++){
		if (d.children[i].children.length > maxLength){
			maxLength = d.children[i].children.length;
			index = i;
		}
	}
	if (index>-1){
		for (var i = 0; i < d.children[index].children.length; i++) {
			result.push(d.children[index].children[i].name);
		};
	}
	return result;
}
// get longest episodes for particular season
function longestEpisodes(d,season){
	// assume d is root
	var maxLength = -1;
	var srs;
	var result = [];
	for (var i = 0; i < d.children.length; i++) {
		if (d.children[i].children.length > season){
			if (d.children[i].children[season].children.length > maxLength){
				maxLength = d.children[i].children[season].children.length;
				srs = d.children[i].name;
			}
		}
	}
	if (maxLength > -1){
		var i = 1;
		if (season == 0){
			i=0;
		}else{
			maxLength++;
		}
		for (i; i < maxLength; i++) {
			result.push(i);
		}
	}
	return result;
}
// Get longest episodes in series
function longestEpisodesInSeries(d,seriesAbbr){
	var maxLength = -1;
	var result = [];
	var j = 0;
	for ( j; j < d.children.length;j++){
		if (d.children[j].name == seriesAbbr){
			break;
		}
	}
	for (var i = 0; i < d.children[j].children.length; i++) {
		if (d.children[j].children[i].children.length > maxLength){
			maxLength = d.children[j].children[i].children.length;
		}
	}
	if (maxLength > -1){
		var i = 1;
		if(seriesAbbr == "TOS"){
			i = 0;
		}
		else{
			maxLength++;
		}
		for (i; i < maxLength; i++) {
			result.push(i);
		}
	}
	//console.log(result);
	return result;
}
// get all episode for particular series and season
function episodesInSeriesSeason(d,series,season){
	var i;
	var result = []
	for (i = 0; i < d.children.length; i++) {
		if (d.children[i].name == series){
			break;
		}
	};
	for (var j=0; j<d.children[i].children[season].children.length;j++){
		result.push(parseInt(d.children[i].children[season].children[j].epNum));
	}
	return result;
}
// calculate average value
function assignAvgValue(d){
	var average = 0;
	if(d.children){
		// d.value = avgValues(d);
		for (var i=0; i<d.children.length; i++){
			// assignAvgValue(d.children[i]);
			average += assignAvgValue(d.children[i]);
		}
		average = average/d.children.length;
		d.value = average;
	}
	else{
		average = parseFloat(d.rating);
		d.value = average;
	}
	return average;
}
// set title for back navigation
function setTitleTextMC(series, season){
	if (series!='') {
		$('#startrek_mc').css({"color":"#0000FF","text-decoration":"underline","cursor": "pointer"});
		$('#series_mc').text(' > '+series);
		$('#season_mc').text('');
	}
	else if (season!='') {
		$('#startrek_mc').css({"color":"#0000FF","text-decoration":"underline","cursor": "pointer"});
		$('#series_mc').text('');
		$('#season_mc').text(' > '+season);
	}
	else {
		$('#startrek_mc').css({"color":"black","text-decoration":"none","cursor": "normal"});
		$('#series_mc').text('');
		$('#season_mc').text('');
	}	
}
// change line chart level
function changeLineChartFocus(tmp,i){
	deleteSVG();
	setTitleTextMC(getSeriesName(tmp), '');
	setInfoPaneText(overallData.children[i], "series");
	seriesLevel(overallData,series[i]);
}
// reset svg
function resetMC() {
	deleteSVG();
	setTitleTextMC('', '');
	seasonLevel(overallData);
}