var allData;
/*var writers;
var directors;

d3.json("writers.json",function(error,data){
	console.log("Loading Writer JSON Data");
	writers = data;
});

d3.json("directors.json",function(error,data){
	console.log("Loading Director JSON Data");
	directors = data;
});*/


    allData = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': "alldata.json",
        'dataType': "json",
        'success': function (data) {
            allData = data;
        }
    });

    hierarchyData = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': "hierarchy.json",
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
	$("#series").text(getSeriesName(obj.series));
	$("#season").text(obj.season);
	$("#episode").text(obj.episode);
	$("#title").text(obj.title);
	$("#url").html('<a href=\"'+obj.imdb_url+'\" target=\"__blank\" >'+obj.imdb_url+'</a>');
	$("#user_rating").text(obj.user_rating);
	$("#user_votes").text(obj.user_votes);
	$("#date").text(obj.date);
	$("#stardate").text(obj.stardate);
	$("#director").text(obj.director);
	$("#writer").text(obj.writer);
	$("#feat_characters").text(obj.feat_characters);
	$("#main_cast").text(obj.main_cast);
	$("#recurring_cast").text(obj.recurring_cast);
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
	$("#series").text(getSeriesName(obj.series));
	$("#season").text(obj.season);
	$("#episode").text(node.children.length + " episodes");
	$("#title").text("");
	$("#url").text("");
	$("#user_rating").text(rating.toFixed(1));
	$("#user_votes").text(obj.user_votes);
	$("#date").text("");
	$("#stardate").text("");
	$("#director").text("");
	$("#writer").text("");
	$("#feat_characters").text("");
	$("#main_cast").text(obj.main_cast);
	$("#recurring_cast").text(obj.recurring_cast);
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
	$("#series").text(getSeriesName(obj.series));
	$("#season").text(node.children.length + " seasons");
	$("#episode").text(eps + " episodes");
	$("#title").text("");
	$("#url").text("");
	$("#user_rating").text(rating.toFixed(1));
	$("#user_votes").text(obj.user_votes);
	$("#date").text("");
	$("#stardate").text("");
	$("#director").text("");
	$("#writer").text("");
	$("#feat_characters").text("");
	$("#main_cast").text("");
	$("#recurring_cast").text("");
}