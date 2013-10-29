var allData;
var writers;
var directors;

d3.json("writers.json",function(error,data){
	console.log("Loading Writer JSON Data");
	writers = data;
});

d3.json("directors.json",function(error,data){
	console.log("Loading Director JSON Data");
	directors = data;
});

/*d3.json("alldata.json",function(error,data){
	console.log("Loading all JSON Data from csv");
	allData = data;
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


function getSeriesName(n){
	if (n=='TOS') return 'The Original Series';
	else if (n=='TNG') return 'The Next Generation';
	else if (n=='DS9') return 'Deep Space Nine';
	else if (n=='VOY') return 'Voyager';
	else if (n=='ENT') return 'Enterprise';
}



function setInfoPaneText(node, rating, type){
	//type = episode, season, or series
	if (type=='episode') setTextEpisode(node, rating);
	else if (type=='season') setTextSeason(node, rating);
	else if (type=='series') setTextSeries(node, rating);
	return;
}

function setTextEpisode(node, rating){
	var obj;
  	$(allData.nodes).each(function(index, element){
    	if(element.title == node.name) {///////
        	obj = element;
        }
	});
	$("#series").text(getSeriesName(obj.series));
	$("#season").text(obj.season);
	$("#episode").text(obj.episode);
	$("#title").text(obj.title);
	$("#url").html('<a href=\"'+obj.imdb_url+'\" target=\"__blank\" >'+obj.imdb_url+'</a>');
	$("#user_rating").text(rating);
	$("#user_votes").text(obj.user_votes);
	$("#date").text(obj.date);
	$("#stardate").text(obj.stardate);
	$("#director").text(obj.director);
	$("#writer").text(obj.writer);
	$("#feat_characters").text(obj.feat_characters);
	$("#main_cast").text(obj.main_cast);
	$("#recurring_cast").text(obj.recurring_cast);
}

function setTextSeason(node, rating){
	var obj;
  	$(allData.nodes).each(function(index, element){
    	if(element.title == node.children[0].name) {///////
        	obj = element;
        }
	});
	$("#series").text(getSeriesName(obj.series));
	$("#season").text(obj.season);
	$("#episode").text(node.children.length + " episodes");
	$("#title").text("");
	$("#url").text("");
	$("#user_rating").text(rating.toFixed(1));
	$("#user_votes").text("");
	$("#date").text("");
	$("#stardate").text("");
	$("#director").text("");
	$("#writer").text("");
	$("#feat_characters").text("");
	$("#main_cast").text(obj.main_cast);
	$("#recurring_cast").text(obj.recurring_cast);
}

function setTextSeries(node, rating){
	var obj;
  	$(allData.nodes).each(function(index, element){
    	if(element.title == node.children[0].children[0].name) {///////
        	obj = element;
        }
	});
	var eps=0;
	for (var i=0; i<node.children.length; i++){
		eps = eps + node.children[i].children.length;
	}
	$("#series").text(getSeriesName(obj.series));
	$("#season").text(node.children.length + " seasons");
	$("#episode").text(eps + " episodes");
	$("#title").text("");
	$("#url").text("");
	$("#user_rating").text(rating.toFixed(1));
	$("#user_votes").text("");
	$("#date").text("");
	$("#stardate").text("");
	$("#director").text("");
	$("#writer").text("");
	$("#feat_characters").text("");
	$("#main_cast").text("");
	$("#recurring_cast").text("");
}