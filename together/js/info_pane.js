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


function setInfoPaneText(node, value, type, chart){
	var rating = 0, votes = 0;
	//console.log(type);
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