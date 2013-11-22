var tooltip;

var abbrFull = {"TOS":"The Original Series","TNG":"The Next Generation", "DS9":"Deep Space Nine","VOY":"Voyager","ENT":"Enterprise"};
var seriesTrick = {"TOS":0,"TNG":1,"DS9":2,"VOY":3,"ENT":4};

var m = [50, 50, 50, 40], // top right bottom left
    w = 700 - m[1] - m[3], // width
    h = 500 - m[0] - m[2]; // height

var margin = [10, 60, 30, 10],
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

d3.json("data/hierarchy.json", function(d) {
	assignAvgValue(d);
	overallData = d;
	// console.log(dimensions);
	series = getSeries(d);

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

	$("#startrek_mc").click(function(){
		if ($(this).css("cursor") != "normal"){
			deleteSVG();
			setTitleTextMC('', '');
			seasonLevel(overallData);
		}
	});

	seasonLevel(d);
});

function seasonLevel(d){

    axis = d3.svg.axis().orient("left");

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

	circle.transition()
		.duration(duration)
		.delay(duration/2)
		.style("opacity",1);

	function setTooltipText(s){
		var srs = s.substring(0,3);
		var sea = parseInt(s.substring(4));
		tooltip.html(abbrFull[srs]+"<br />Season "+(sea+1)+"<br /> Average Rating: "+parseFloat(d.children[seriesTrick[srs]].children[sea].value).toFixed(1));
		return tooltip.style("visibility", "visible");
	}
	
	function setIPText(c){
		var srs = c.substring(0,3);
		var sea = parseInt(c.substring(4));
		setInfoPaneText(d.children[seriesTrick[srs]].children[sea], "season");
	
	}
	
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

	function path(s) {
		return line(lineData[s].map(function(p) {
			// console.log(y[p](getScore(d,s,p)));
			return [x(p), y[p](getScore(d,s,p))];
		}));
	}

	function seasonNumber(tmp,i){
		// exit();
		deleteSVG();
		setTitleTextMC('', tmp);
		setInfoPaneTextForSeason(i+1, seriesHasSeason(d,i), d);
		episodeLevel(d,i);
	}

	function seriesNo(tmp,i){
		// exit();
		deleteSVG();
		setTitleTextMC(getSeriesName(tmp), '');
		setInfoPaneText(d.children[i], "series");
		seriesLevel(d,series[i]);
	}
}

function episodeLevel(d,season){
	d3.select("#linechart")
		.append("div")
		.attr("class","mc ")
		.html("Back to Overview Level");
	//get all series has that season number
	var seriesForSeason = seriesHasSeason(d,season);

	height = (500/seriesForSeason.length) - margin[0] - margin[2];
	// console.log(d,season);
	for (var i = 0; i < seriesForSeason.length; i++) {
		x[seriesForSeason[i]] = d3.scale.ordinal().rangePoints([0, width], 1).domain(episodesInSeriesSeason(d,seriesForSeason[i],season));
		y[seriesForSeason[i]] = d3.scale.linear().range([height, 0]).domain(seriesSeasonMaxMin(d,seriesForSeason[i],season));
	}

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
		.attr("transform", function(s){ var tmp = x[s].domain().length > 29? x[s].domain().length-1:x[s].domain().length; return "translate("+ x[s](tmp) +")";})
		.attr("class","axis")
		.each(function(s){d3.select(this).call(axis.scale(y[s]).tickValues(y[s].domain()).orient("right"));})
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
		.each(function(s){d3.select(this).call(axis.scale(x[s]).tickValues(x[s].domain()).orient("bottom"));});

	svg.append("svg:line")
		.attr("class","axis")
		.attr("x1",function(s){return x[s](x[s].domain()[0])})
		.attr("y1",height)
		.attr("x2",function(s){return x[s](x[s].domain()[x[s].domain().length - 1])})
		.attr("y2",height)
		.style("stroke","black")
		.style("stroke-width",1)
		.style("opacity",1)
		.style("shape-rendering","crispedges");


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
		.attr("cx",function(s){return x[s.substring(0,3)](s.substring(4))})
		.attr("cy",function(s){return y[s.substring(0,3)](getEpisodeScore(d,s.substring(0,3),season,s.substring(4)))})
		.attr("r",3)
		.style("opacity",0)
		.style("fill","rgb(214,214,214)")
		.style("stroke","rgb(50,50,50)")
		.on("mouseover", function(s){ setTooltipText(s); })
		.on("mousemove", function(){ return tooltip.style("top", (d3.event.pageY)+"px").style("left",(d3.event.pageX+20)+"px"); })
		.on("mouseout", function(){ return tooltip.style("visibility", "hidden"); })
		.on("click", function(c){setIPText(c);});

	yAxis.transition()
		.duration(duration)
		.delay(duration/2)
		.style("opacity",1);

	function setTooltipText(s){
		var srs = s.substring(0,3);
		var epi = parseInt(s.substring(4));
		var calculatedEpi = (srs == "TOS" && season == 0)?epi:(epi-1);
		tooltip.html(abbrFull[srs]+"<br />Season "+(season+1)+"<br />Episode "+epi+"<br />Average Rating: "+parseFloat(d.children[seriesTrick[srs]].children[season].children[calculatedEpi].value).toFixed(1));
		return tooltip.style("visibility", "visible");
	}

	function setIPText(c){
		var srs = c.substring(0,3);
		var epi = parseInt(c.substring(4));
		var calculatedEpi = (srs == "TOS" && season == 0)?epi:(epi-1);
		setInfoPaneText(d.children[seriesTrick[srs]].children[season].children[calculatedEpi], "episode");
	}
	
	function path(s) {
		return line(x[s].domain().map(function(p) {
			// console.log(s,p);
			// console.log(y[p](getScore(d,s,p)));
			return [x[s](p), y[s](getEpisodeScore(d,s,season,p))];
		}));
	}

	function flatPath(s){
		return line(x[s].domain().map(function(p) {
			return [x[s](p), height];
		}));
	}

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

	function seriesNo(tmp,i){
		// exit();
		deleteSVG();
		setTitleTextMC(getSeriesName(tmp), '');
		setInfoPaneText(d.children[i], "series");
		seriesLevel(d,seriesForSeason[i]);
	}
}

function seriesLevel(d,seriesAbr){
	// get all series has that season number
	var seasonForSeries = seasonInSeries(d,seriesAbr);

	height = (500/seasonForSeries.length) - margin[0] - margin[2];
	for (var i = 0; i < seasonForSeries.length; i++) {
		x[seasonForSeries[i]] = d3.scale.ordinal().rangePoints([0, width], 1).domain(episodesInSeriesSeason(d,seriesAbr,i));
		y[seasonForSeries[i]] = d3.scale.linear().range([height, 0]).domain(seriesSeasonMaxMin(d,seriesAbr,i));
	}

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
		.attr("transform", function(s){ var tmp = x[s].domain().length > 29? x[s].domain().length-1:x[s].domain().length; return "translate("+ x[s](tmp) +")";})
		.attr("class","axis")
		.each(function(s){d3.select(this).call(axis.scale(y[s]).tickValues(y[s].domain()).orient("right"));})
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
		.each(function(s){d3.select(this).call(axis.scale(x[s]).tickValues(x[s].domain()).orient("bottom"));});

	svg.append("svg:line")
		.attr("class","axis")
		.attr("x1",function(s){return x[s](x[s].domain()[0])})
		.attr("y1",height)
		.attr("x2",function(s){return x[s](x[s].domain()[x[s].domain().length - 1])})
		.attr("y2",height)
		.style("stroke","black")
		.style("stroke-width",1)
		.style("opacity",1)
		.style("shape-rendering","crispedges");

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
		.attr("cx",function(s){return x[s.substring(0,s.indexOf("_"))](s.substring(s.indexOf("_")+1))})
		.attr("cy",function(s){return y[s.substring(0,s.indexOf("_"))](getEpisodeScore(d,seriesAbr,s.substring(0,s.indexOf("_")),s.substring(s.indexOf("_")+1)))})
		.attr("r",3)
		.style("opacity",0)
		.style("fill","rgb(214,214,214)")
		.style("stroke","rgb(50,50,50)")
		.on("mouseover", function(s){ setTooltipText(s); })
		.on("mousemove", function(){ return tooltip.style("top", (d3.event.pageY)+"px").style("left",(d3.event.pageX+20)+"px"); })
		.on("mouseout", function(){ return tooltip.style("visibility", "hidden"); })
		.on("click", function(c){setIPText(c);});

	yAxis.transition()
		.duration(duration)
		.delay(duration/2)
		.style("opacity",1);

	function setTooltipText(s){
		var season = parseInt(s.substring(0,s.indexOf("_")));
		var epi = parseInt(s.substring(s.indexOf("_")+1));
		var calculatedEpi = (seriesAbr == "TOS" && season == 0)?epi:(epi-1);
		tooltip.html(abbrFull[seriesAbr]+"<br />Season "+(season+1)+"<br />Episode "+epi+"<br />Average Rating: "+parseFloat(d.children[seriesTrick[seriesAbr]].children[season].children[calculatedEpi].value).toFixed(1));
		return tooltip.style("visibility", "visible");
	}

	function setIPText(c){
		var season = parseInt(c.substring(0,c.indexOf("_")));
		var epi = parseInt(c.substring(c.indexOf("_")+1));
		var calculatedEpi = (seriesAbr == "TOS" && season == 0)?epi:(epi-1);
		setInfoPaneText(d.children[seriesTrick[seriesAbr]].children[season].children[calculatedEpi], "episode");
	}
	
	function path(s) {
		return line(x[s].domain().map(function(p) {
			// console.log(s,p);
			// console.log(y[p](getScore(d,s,p)));
			return [x[s](p), y[s](getEpisodeScore(d,seriesAbr,s,p))];
		}));
	}

	function flatPath(s){
		return line(x[s].domain().map(function(p) {
			return [x[s](p), height];
		}));
	}

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

    function seasonNumber(tmp,i){
		// exit();
		deleteSVG();
		setTitleTextMC('', 'Season '+(tmp+1));
		setInfoPaneTextForSeason(i+1, seriesHasSeason(d,i), d);
		episodeLevel(d,i);
	}
}

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

function seriesHasSeason(d,season){
	var shs = [];
	for (var i = 0; i < d.children.length; i++) {
		if(d.children[i].children.length > season){
			shs.push(d.children[i].name);
		} 
	}
	return shs;
}

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

function deleteSVG(){
	d3.selectAll(".mc").remove();
}

function exit(){
	// path exit transition
	foreground.transition()
      .duration(duration)
      .style("opacity", 0);
    // axis transition
    g.transition()
      .duration(duration)
      .delay(duration/2)
      .attr("transform", function() {return "translate(" + m[3] + ")"; })
      .style("opacity",0);
    //remove elements
    svg.selectAll(".dimension").remove();
    svg.selectAll(".foreground").remove();
    svg.selectAll(".sublegend").remove();
    svg.selectAll(".legend").remove();
}

function flatPath(){
	return line(dimensions.map(function(p){
		return [x(p),400];
	}));
}

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

function getSeries(d){
	// assume d is root
	var s = [];
	for (var i = 0; i < d.children.length; i++) {
		s.push(d.children[i].name);
	}
	return s;
}

function seasonsInSeries(d,seriesNumber){
	// assume d is root
	var result = [];
	for (var i = 0; i < d.children[seriesNumber].children.length; i++) {
		result.push(i); //d.children[seriesNumber].children[i].name
	}
	return result;
}

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

function longestEpisodes(d,season){
	// assume d is root
	var maxLength = -1;
	var result = [];
	for (var i = 0; i < d.children.length; i++) {
		if (d.children[i].children.length > season){
			if (d.children[i].children[season].children.length > maxLength){
				maxLength = d.children[i].children[season].children.length;
			}
		}
	}
	if (maxLength > -1){
		for (var i = 1; i < maxLength; i++) {
			result.push(i);
		}
	}
	return result;
}

function longestEpisodesInSeries(d,seriesNumber){
	var maxLength = -1;
	var result = [];
	for (var i = 0; i < d.children[seriesNumber].children.length; i++) {
		if (d.children[seriesNumber].children[i].children.length > maxLength){
			maxLength = d.children[seriesNumber].children[i].children.length;
		}
	}
	if (maxLength > -1){
		for (var i = 1; i < maxLength; i++) {
			result.push(i);
		}
	}
	return result;
}

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