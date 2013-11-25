var allData, hierarchyData;

    $.ajax({
        'async': false,
        'global': false,
        'url': "data/alldata.json",
        'dataType': "json",
        'success': function (data) {
            allData = data;
        }
    });

    $.ajax({
        'async': false,
        'global': false,
        'url': "data/hierarchy.json",
        'dataType': "json",
        'success': function (data) {
            hierarchyData = data;
        }
    });


function getSeriesName(n){
	if (n=='TOS') return 'The Original Series';
	else if (n=='TNG') return 'The Next Generation';
	else if (n=='DS9') return 'Deep Space Nine';
	else if (n=='VOY') return 'Voyager';
	else if (n=='ENT') return 'Enterprise';
}

function getVotes(thing){
	var count = 0;
	if (thing.children){
		for (var i=0; i<thing.children.length; i++){
			count += getVotes(thing.children[i]);
		}
	}
	else {
		count = parseFloat(thing.numOfVotes);
	}
	return count;
}

var avgRating = function (input) {
	var derp = [0, 0]; //total rating, total count
	derp[0] = 0;
	derp[1] = 0;
	if (input.children){
		for (var i=0; i<input.children.length; i++){
			var derp2 = avgRating(input.children[i]);
			derp[0] += derp2[0];
			derp[1] += derp2[1];
		}
	}
	else {
		derp[0] = parseFloat(input.rating);
		derp[1] = 1;
	}
	return derp;
}



function avgValues(d) {
	var count=0;
	if (d.children){
		for(var i=0; i<d.children.length; i++){
			count += avgValues(d.children[i]);
		}
		d.value = d.value/count;
	}
	else {count = 1;}  //d has no children
	return count;
}

function getAvg(data) {
	var herp = avgRating(data);
	if (herp[1]!=0){
		return herp[0]/herp[1];
	}
	else
		return herp[0];
}

//node is a bar in the bar chart hierarchy
function setInfoPaneText(node, type){
	if (type=='episode') setTextEpisode(node);
	else if (type=='season') setTextSeason(node);
	else if (type=='series') {setTextSeries(node);}
	return;
}

function setTextEpisode(node){
	var obj;
  	$(allData.nodes).each(function(index, element){
    	if(element.title == node.name) {
        	obj = element;
        }
	});
	$("#series").html("<strong>Series:</strong> "+getSeriesName(obj.series));
	$("#season").html("<strong>Season:</strong> "+obj.season);
	$("#episode").html("<strong>Episode:</strong> "+obj.episode);
	$("#title").html("<strong>Title:</strong> "+obj.title);
	$("#url").html("<strong>IMDB:</strong> <a href=\""+obj.imdb_url+'\" target=\"__blank\" >'+obj.imdb_url+'</a>');
	$("#user_rating").html("<strong>Average Rating:</strong> "+obj.user_rating);
	$("#user_votes").html("<strong>Number of Votes:</strong> "+obj.user_votes);
	$("#date").html("<strong>Air Date:</strong> "+obj.date);
	$("#stardate").html("<strong>Stardate:</strong> "+obj.stardate);
	$("#director").html("<strong>Director:</strong> "+obj.director);
	$("#writer").html("<strong>Writer:</strong> "+obj.writer);
	$("#feat_characters").html("<strong>Featured Characters:</strong> "+obj.feat_characters);
	$("#main_cast").html("<strong>Main Cast:</strong> "+obj.main_cast);
	$("#recurring_cast").html("<strong>Recurring Cast:</strong> "+obj.recurring_cast);
}

function setTextGivenEpisode(obj){
	$("#series").html("<strong>Series:</strong> "+getSeriesName(obj.series));
	$("#season").html("<strong>Season:</strong> "+obj.season);
	$("#episode").html("<strong>Episode:</strong> "+obj.episode);
	$("#title").html("<strong>Title:</strong> "+obj.title);
	$("#url").html("<strong>IMDB:</strong> <a href=\""+obj.imdb_url+'\" target=\"__blank\" >'+obj.imdb_url+'</a>');
	$("#user_rating").html("<strong>Average Rating:</strong> "+obj.user_rating);
	$("#user_votes").html("<strong>Number of Votes:</strong> "+obj.user_votes);
	$("#date").html("<strong>Air Date:</strong> "+obj.date);
	$("#stardate").html("<strong>Stardate:</strong> "+obj.stardate);
	$("#director").html("<strong>Director:</strong> "+obj.director);
	$("#writer").html("<strong>Writer:</strong> "+obj.writer);
	$("#feat_characters").html("<strong>Featured Characters:</strong> "+obj.feat_characters);
	$("#main_cast").html("<strong>Main Cast:</strong> "+obj.main_cast);
	$("#recurring_cast").html("<strong>Recurring Cast:</strong> "+obj.recurring_cast);
}

function setTextSeason(node){
	var obj, hobj;
  	$(allData.nodes).each(function(index, element){
    	if(element.title == node.children[0].name) {
        	obj = element;
        }
	});
	
	$(hierarchyData.children).each(function(index, element){
		if (element.name == obj.series){
			$(element.children).each(function(index2, element2){
				if (element2.name == "Season "+obj.season){
					hobj = element2;
				}
			});
		}
	});

	var rating = getAvg(hobj);
	var votes = getVotes(hobj);
	$("#series").html("<strong>Series:</strong> "+getSeriesName(obj.series));
	$("#season").html("<strong>Season:</strong> "+obj.season);
	$("#episode").html("<strong># of Episodes:</strong> "+node.children.length);
	$("#title").html("");
	$("#url").html("");
	$("#user_rating").html("<strong>Average Rating:</strong> "+rating.toFixed(1));
	$("#user_votes").html("<strong>Number of Votes:</strong> "+votes);
	$("#date").html("");
	$("#stardate").html("");
	$("#director").html("");
	$("#writer").html("");
	$("#feat_characters").html("");
	$("#main_cast").html("<strong>Main Cast:</strong> "+obj.main_cast);
	$("#recurring_cast").html("<strong>Recurring Cast:</strong> "+obj.recurring_cast);
}

function setTextSeries(node){
	var obj, hobj;
  	$(allData.nodes).each(function(index, element){
    	if(element.title == node.children[0].children[0].name) {
        	obj = element; //gets an episode
        }
	});
	
	$(hierarchyData.children).each(function(index, element){
    	if(element.name == obj.series) {
        	hobj = element;
        }
	});

	var eps=0;
	for (var i=0; i<node.children.length; i++){
		//console.log(node.children[i].children.length);
		eps = eps + node.children[i].children.length;
	}

	var rating = getAvg(hobj);
	var votes = getVotes(hobj);
	$("#series").html("<strong>Series:</strong> "+getSeriesName(obj.series));
	$("#season").html("<strong># of Seasons:</strong> "+node.children.length);
	$("#episode").html("<strong># of Episodes:</strong> "+eps);
	$("#title").html("");
	$("#url").html("");
	$("#user_rating").html("<strong>Average Rating:</strong> "+rating.toFixed(1));
	$("#user_votes").html("<strong>Number of Votes:</strong> "+votes);
	$("#date").html("");
	$("#stardate").html("");
	$("#director").html("");
	$("#writer").html("");
	$("#feat_characters").html("");
	$("#main_cast").html("");
	$("#recurring_cast").html("");
}


function updateByExplore(data,flag){
	//add "<strong>Series:</strong> " to headers
	var series = "";
	var season = "";
	var episode = "";
	var title = "";
	var url = "";
	var date = "";
	var stardate = "";
	var director = "";
	var writer = "";
	var featChar = "";
	var maincast = "";
	var recccast = "";
	var rating = "";
	var votes = "";
	var hobj;
	
	
	if(flag==0){
		return;
	}
	else if(flag==1){
		series = "<strong>Series:</strong> "+getSeriesName(data[0].name);
		season = "<strong># of Seasons:</strong> "+data[0].children.length;
		
		$(hierarchyData.children).each(function(index, element){
			if(element.name == data[0].name) {
				hobj = element;
			}
		});
		var num = getAvg(hobj);
		rating = "<strong>Average Rating:</strong> "+num.toFixed(1);
		votes = "<strong>Number of Votes:</strong> "+getVotes(hobj);
	}
	else if(flag==2){
		hobj = hierarchyData.children[data[0].parentIndex-1];
		series = "<strong>Series:</strong> "+getSeriesName(hobj.name);
		season = "<strong>Season:</strong> "+data[0].name;
		episode = "<strong># of Episodes:</strong> "+data[0].children.length
		
		$(hobj.children).each(function(index, element){
			if(element.name == data[0].name) {
				hobj = element;
				return false;
			}
		});
		
		var num = getAvg(hobj);
		rating = "<strong>Average Rating:</strong> "+num.toFixed(1);
		votes = "<strong>Number of Votes:</strong> "+getVotes(hobj);
	}
	else if(flag==3){
		setTextGivenEpisode(allData.nodes[data[0].info.exact-1]);
		return;
	}
	else if(flag==4){
		director = "<strong>Director:</strong> "+ data[0].name;
		episode = "<strong>Number of episodes directed:</strong> "+data[0].children.length;
		var temp = james_avg(data[0]);
		rating = "<strong>Average Rating per Episode:</strong> "+temp.rate.toFixed(1);
		votes = "<strong>Number of Votes:</strong> "+temp.vote_num;
		
	}
	else if(flag==5){
		writer = "<strong>Writer:</strong> "+ data[0].name;
		episode = "<strong>Number of episodes written:</strong> "+data[0].children.length;
		var temp = james_avg(data[0]);
		rating = "<strong>Average Rating per Episode:</strong> "+temp.rate.toFixed(1);
		votes = "<strong>Number of Votes:</strong> "+temp.vote_num;
	}
	else if(flag==6){
		director = "<h3>Directors:</h3> <br \>";
		var data2 = [];
		$.each(data, function(i,d){
			data2.push(d);
		});
		
		data2.shift();
		
		$.each(data2, function(i,d){
			director+="<a href=\"javascript:james('"+d.name+"',4)\">"+d.name+"</a><br \>";
		});
	}
	else if(flag==7){
		writer = "<h3>Writers:</h3> <br \>";
		
		var data2 = [];
		$.each(data, function(i,d){
			data2.push(d);
		});
		
		data2.shift();
		
		$.each(data2, function(i,d){
			writer+="<a href=\"javascript:james('"+d.name+"',5)\">"+d.name+"</a><br \>";
		});
	}
	
	$("#series").html(series);
	$("#season").html(season);
	$("#episode").html(episode);
	$("#title").html(title);
	$("#url").html(url);
	$("#user_rating").html(rating);
	$("#user_votes").html(votes);
	$("#date").html(date);
	$("#stardate").html(stardate);
	$("#director").html(director);
	$("#writer").html(writer);
	$("#feat_characters").html("");
	$("#main_cast").html("");
	$("#recurring_cast").html("");
}
function james(nameOfPerson, flag){
	var obj = {"rName":nameOfPerson};
	render(grabPerson(obj,flag),flag);
}

function james_avg(data){
	var avg_rate = 0.0;
	var tot_votes = 0;
	$.each(data.children, function(i,d){
		var epi = allData.nodes[d.exact-1];
		avg_rate+=parseFloat(epi.user_rating);
		tot_votes+=parseFloat(epi.user_votes);
	});
	avg_rate = avg_rate/data.children.length;
	
	var toRet = {"vote_num":tot_votes, "rate":avg_rate};
	return toRet;
}

function setInfoPaneTextForSeason(sNum, seriesArray, data){
	var text = '';
	var obj1, obj2;
	
	for (var i=0; i<seriesArray.length; i++){
		var innerText = '<strong>Series:</strong> '+getSeriesName(seriesArray[i])+'<br />';
	
		$(hierarchyData.children).each(function(index, element){
			if (element.name == seriesArray[i]){
				obj1 = element;
				$(element.children).each(function(index2, element2){
					if (element2.name == "Season "+sNum){
						obj2 = element2;
					}
				});
			}
		});

		var rating = getAvg(obj2);
		var votes = getVotes(obj2);
		innerText += '<strong>Season:</strong> '+sNum+'<br />'+
				'<strong># of Episodes:</strong> '+obj2.children.length+'<br />'+
				'<strong>Average Rating:</strong> '+rating.toFixed(1)+'<br />'+
				'<strong>Number of Votes:</strong> '+votes+'<br /><br />';
				
		text += innerText;
	}
	
	$("#series").html(text);
	$("#season").html('');
	$("#episode").html('');
	$("#title").html("");
	$("#url").html("");
	$("#user_rating").html('');
	$("#user_votes").html('');
	$("#date").html("");
	$("#stardate").html("");
	$("#director").html("");
	$("#writer").html("");
	$("#feat_characters").html("");
	$("#main_cast").html('');
	$("#recurring_cast").html('');
	

}
