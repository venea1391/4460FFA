var inData;
var csvData;
var writers;
var directors;
var colorArray = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd","red"];
var titleArray = ["The Original Series","The Next Genration", "Deep Space Nine", "Voyager","Enterprise"]

d3.csv("startrekStrictNoComma.csv",function(data){
	console.log("Loading CSV Data");
	csvData = data;
});

d3.json("data.json",function(error,data){
	console.log("Loading JSON Data");
	inData = data;
});

d3.json("writers.json",function(error,data){
	console.log("Loading Writer JSON Data");
	writers = data;
});

d3.json("directors.json",function(error,data){
	console.log("Loading Director JSON Data");
	directors = data;
});

function toolText(data, flag, index){
	var toReturn = "";
	if(flag==0){
		if(index>2){
			var i = seriesIndexFromName(data.name);
			toReturn+=titleArray[i] +" <br /> ";
			toReturn+= data.children.length + " Seasons";
			return toReturn;
		}
		return data.name;
	}
	else if(flag==1){
		if(index!=0){
			toReturn+=data.name+" <br /> ";
			toReturn+= data.children.length + " Episodes";
			return toReturn;
		}
		return toolText(data,0,3);
	}
	else if(flag==2 || flag==4 || flag==5){
		if(index!=0){
			var epiData = csvData[data.exact-1];
			toReturn+= "Episode: "+ epiData.episode + " <br /> ";
			toReturn+= epiData.title + " <br /> ";
			toReturn+= "Rating: " + epiData.rating + " <br /> ";
			toReturn+= "Director: " + epiData.director + " <br /> ";
			toReturn+= "Writer: " + epiData.writer;
			if(flag==4 || flag==5){
				var i = seriesIndexFromName(epiData.series);
				toReturn+=" <br /> ";
				toReturn+= "Series: "+ titleArray[i] + " <br /> ";
				toReturn+= "Season: "+ epiData.season;
			}
			return toReturn;
		}
	}
	return data.name;
}

function seriesIndexFromName(name){
	if(name=="TOS"){
		return 0;
	}
	else if(name=="TNG"){
		return 1;
	}
	else if(name=="DS9"){
		return 2;
	}
	else if(name=="VOY"){
		return 3;
	}
	else if(name=="ENT"){
		return 4;
	}
	return 5;
}

function nodeColor(data, index, flag){
/*
	.TOS {stroke:#1f77b4;} cyan
	.TNG {stroke:#ff7f0e;} burlywood
	.DS9 {stroke:#2ca02c;} chartreuse
	.VOY {stroke:#d62728;} orange
	.ENT {stroke:#9467bd;} greenyellow
	writers - moccasin
	directors - limegreen
	go back = RED 
	done = gray	
*/
	if(flag==0){
		if(index==0){
			return "gray";
		}
		if(index==1){
			return "limegreen";
		}
		if(index==2){
			return "moccasin";
		}
		var indexToGo = seriesIndexFromName(data.name);
		return colorArray[indexToGo];
	}
	else if(flag==1){
		if(index==0){
			return "tomato";
		}
		return colorArray[data.parentIndex-1];
	}
	else if(flag==2 || flag==4 || flag==5){
		if(index==0){
			return "tomato";
		}
		var episodeInfo = csvData[data.exact-1];
		var indexToGo = seriesIndexFromName(episodeInfo.series)
		return colorArray[indexToGo];
	}
	else if(flag==3){
		if(index==0){
			return "gray";
		}
		if(index<3){
			var indexToGo = seriesIndexFromName(data.s)
			return colorArray[indexToGo];
		}
		if(index==3){
			return "limegreen";
		}
		if(index==4){
			return "moccasin";
		}
	}
	else if(flag==6){
		if(index==0){
			return "tomato";
		}
		return "limegreen";
	}
	else if(flag==7){
		if(index==0){
			return "tomato";
		}
		return "moccasin";
	}
}

function getData(flag){
	if(flag == 0){
		return inData;
	}
	else if(flag==6){
		return directors;
	}
	else if(flag==7){
		return writers;
	}

}

function grabPerson(data, flag){
	if(flag==4){ // directors
		for(var i=0; i < directors.nodes.length; i++){
			if(directors.nodes[i].name == data.rName){
				return directors.nodes[i];
			}
		}
	}
	else{
		for(var i=0; i < writers.nodes.length; i++){
			if(writers.nodes[i].name == data.rName){
				return writers.nodes[i];
			}
		}
	}
}


function episodeRegrab(episodeNode, flag){
	console.log("THIS IS THE EPISODE YOU ARE LOOKING AT (SHOULD BE)");
	console.log(episodeNode);
	console.log(csvData[episodeNode.exact-1]);
	var epData = csvData[episodeNode.exact-1];
	var seriesIndex = seriesIndexFromName(epData.series);
	if(flag==1){
		return inData.nodes[seriesIndex];
	}
	else if(flag==2){
		return inData.nodes[seriesIndex].children[epData.season-1];
	}
}

function dataRegrab(data,flag){
	if(flag==0){
		return inData;
	}
	else if(flag==1){
		return inData.nodes[data.parentIndex-1];
	}
}

function test(){
	render(inData,0);
}
//method that takes in data and flag to determin amout of nodes that will be needed (plus 1 to account for root)
function generateCount(data, flag){
	if(flag==0){
		return data.nodes.length + 3;
	}
	else if(flag == 1 || flag == 2 || flag==4|| flag==5){
		return data.children.length +1;
	}
	else if(flag == 3){
		return 5;
	}
	else if(flag==6 || flag==7){
		return data.nodes.length +1;
	}
}

//generates nodes based on inutt data
function generateNodes(data, flag){
	var toRet = [];
	if(flag==0){ //top level
		toRet.push({"name":"Star Trek"});
		toRet.push({"name":"Directors"});
		toRet.push({"name":"Writers"});
		$.each(data.nodes, function(i,d){
			toRet.push(d);
		});
		return toRet;
	}
	else if(flag==1 || flag==2 || flag==4 || flag==5){ //series and season level, and directors, and writers
		toRet.push(data);
		$.each(data.children, function(i,d){
			toRet.push(d);
		});
		return toRet;
	}
	else if(flag == 3){ //episode level
		var episodeData = csvData[data.exact-1];
		toRet.push({"name":episodeData.title+" Episode " +episodeData.episode, "s":episodeData.series});
		toRet.push({"name":"Series "+episodeData.series, "s":episodeData.series});
		toRet.push({"name":"Season "+episodeData.season, "s":episodeData.series});
		toRet.push({"name":"Director: "+ episodeData.director , "rName":episodeData.director});
		toRet.push({"name":"Writer: "+episodeData.writer ,"rName":episodeData.writer});
		return toRet;
	}
	else if(flag == 6 || flag == 7){
		var root;
		if(flag==6){
			root = {"name":"Directors"};
		}else{
			root = {"name":"Writers"};
		}
		toRet.push(root);
		$.each(data.nodes, function(i,d){
			toRet.push(d);
		});
		return toRet;
	}
}

function render(input, flag){
	//Mark old nodes and lines as exiting
	var exitNode = d3.selectAll("#james circle").attr("class","exit");
	var exitLine = d3.selectAll("#james line").attr("class","exit");
	var exitText = d3.selectAll("#james text").attr("class","exit");
	
	//Exit transition bs
	var exitTran = exitNode.transition()
		.duration(750)
		.style("opacity",1e-6)
		.remove();
		
	var exitLineTran = exitLine.transition()
		.duration(750)
		.style("opacity",1e-6)
		.remove();
		
	var exitTextTran = exitText.transition()
		.duration(750)
		.style("opacity",1e-6)
		.remove();
	
	d3.select("#james").transition()
		.duration(750)
		.style("opacity",1e-6)
		.remove(); //removes old so you can add new
	
	d3.select("tooltiphelp")
		.remove();
		
	var inputNodes = generateNodes(input, flag),
		n = generateCount(input, flag);
		
	var width = 750,
		height = 750;
		
	
	
	var nodes = [], //d3.range(n).map(function() { return {}; }),
		links = []; //d3.range(n).map(function(d) { return {source: 0, target: (d + input) % n}; });
	
	var force = d3.layout.force()
		.nodes(nodes)
		.links(links)
		.charge(-500)
		.linkDistance(75)
		.size([width, height]);

	//console.log("nodes before");
	//console.log(nodes);
	//will need to check what level we are on, in this case just assuming 0
	
	
	var R =  ((3*5*n)/2*Math.PI);
	
	
	//push nodes into force layout
	$.each(inputNodes, function(i,d){
		nodes.push(d);
		if(i!=0){
			links.push({source: 0, target: i});
		}
	});
	
	var incrementN = 0;
	//seting all the nodes to have specific X's and Y's still needs to be fixed
	nodes.forEach(function(d, i) {
		if(i!=0){
			d.x = (width/2)+R*Math.cos(incrementN);
			d.y = (height/2)+R*Math.sin(incrementN);
			incrementN+=((2*Math.PI)/n);
		}else{
			d.x = (width/2);
			d.y = (height/2);
			d.fixed = true;
		}
	});
	
	
	
	//console.log("nodes after");
	//console.log(nodes);

	var svg = d3.select(".graph_div").append("svg:svg")
		.attr("id", "james")
		.attr("width", width)
		.attr("height", height);
		
		svg.transition()
		.duration(750);

	var loading = svg.append("text")
		.attr("x", width / 2)
		.attr("y", height / 2)
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.style("opacity",1e-6)
		.text("Simulating. One moment please�");
		
	var tooltip = d3.select("body")
	.append("div")
	.attr("class","tooltiphelp")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("background", "white")
	.style("opacity", ".8")
	.style("visibility", "hidden");
	//.text("a simple tooltip");

	// Use a timeout to allow the rest of the page to load first.
	setTimeout(function() {

	  // Run the layout a fixed number of times.
	  // The ideal number of times scales with graph complexity.
	  // Of course, don't run too long�you'll hang the page!
	  force.start();
	  for (var i = n*n*n; i > 0; --i) force.tick();
	  force.stop();

	  svg.selectAll("line")
		  .data(links)
		.enter().append("line")
		  .attr("x1", function(d) { return d.source.x; })
		  .attr("y1", function(d) { return d.source.y; })
		  .attr("x2", function(d) { return d.target.x; })
		  .attr("y2", function(d) { return d.target.y; })
		  .style("opacity",1e-6); //HERE JAMES;

	  var node = svg.selectAll("circle")
		  .data(nodes)
		.enter().append("circle")
		  .attr("class", "node")
		  .attr("cx", function(d) { return d.x; })
		  .attr("cy", function(d) { return d.y; })
		  .attr("r", function(d,i){ 
						if(i==0){
							return 20;
						}
						else{
							return 10;
						}
						
				})
		  .attr("fill", function(d,i){
				return nodeColor(d,i,flag);
			})
		  .style("opacity",1e-6) //HERE JAMES
		.on("mouseover", function(d,i){
			console.log("Index: "+i);
			console.log(d);
			//tooltip.text(d.name);
			tooltip.html(toolText(d,flag,i));
			return tooltip.style("visibility", "visible");
		})
		.on("mousemove", function(d, i){
			//console.log(event);
			return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
		})
		.on("mouseout", function(){
			return tooltip.style("visibility", "hidden");
		})
		.on("click", function(d,i){
			console.log("Flag: "+flag);
			console.log("Index: "+i);
			tooltip.style("visibility", "hidden");
			if((flag==0 && i==0)||(flag==3 && i==0)){ //Does nothing at top and bottom of treee
				return;
			}
			if(flag==0){
				if(i==1){//Selected directors TODO
					render(getData(6),6);
					return;
				}
				else if(i==2){//Selected writers TODO
					render(getData(7),7);
					return;
				}
			}
			if(flag==3){
				if(i==1){ //Selected series to go back to
					render(episodeRegrab(input,(1)),1);
					return;
				}
				else if(i==2){ //Selected season to go back to
					render(episodeRegrab(input,(2)),2);
					return;
				}
				else if(i==3){//Selected director TODO
					render(grabPerson(d,4),4);
					return;
				}
				else if(i==4){//Selected writer TODO
					render(grabPerson(d,5),5);
					return;
				}
			}
			if(flag ==4 || flag==5){ // in specific writer or director node
				if(i==0){
					if(flag == 4){
						render(getData(6),6);
						return;
					}
					else if(flag==5){
						render(getData(7),7);
						return;
					}
					//return; // go back to all directors or writers TODO
				}
				render(d,3);
				return;
			}
			if(flag==6||flag==7){ // inside of all writers or all directors
				if(i==0){
					render(getData(0),0);
					return;
				}
				
				if(flag==6){ // selecting a director
					render(d,4);
					return;
				}
				else if(flag==7){ // selecting a writer
					render(d,5);
					return;
				}
			}
			
			if(i==0){ //Going back!
				render(dataRegrab(d,(flag-1)),(flag-1));
				return;
			}
			render(d, flag+1); //dig deeper in a node
		});
		
		var texts = svg.selectAll("text.label")
                .data(nodes)
                .enter().append("text")
                .attr("class", "label")
                .attr("fill", "black")
				.style("font-weight", "bold")
				.style("opacity",1e-6) //HERE JAMES
                .text(function(d,i){
					if((i!=0&&flag==2) || (i!=0&&flag==4) || (i!=0&&flag==5)){
						return ""+d.episode;
					}
					return d.name;  });
		
		texts.attr("transform", function(d) {
			return "translate(" + (d.x +20) + "," + d.y + ")";
		});
		
	  loading.remove();
	  
	  var enterN = d3.selectAll("#james circle");
	var enterL = d3.selectAll("#james line");
	var enterT = d3.selectAll("#james text");
	var exitNode = d3.selectAll("#james circle").attr("class","exit");
	var exitLine = d3.selectAll("#james line").attr("class","exit");
	var exitText = d3.selectAll("#james text").attr("class","exit");
	
	//Exit transition bs
	var enterTran = exitNode.transition()
		.duration(1600)
		.style("opacity",1);
		
	var enterLineTran = exitLine.transition()
		.duration(1600)
		.style("opacity",1);
		
	var enterTextTran = exitText.transition()
		.duration(1600)
		.style("opacity",1);
		
	}, 10);
	
}
