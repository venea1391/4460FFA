var colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", '#ccc'];

function setTitleText(node){
	if (node.children && node.children[0].children && node.children[0].children[0].children) {
		$('#series_from_title').text('');
		$('#season_from_title').text('');
		$('#episode_from_title').text('');
	}
	else if (node.children && node.children[0].children) {
		//series
		$('#series_from_title').text(getSeriesName(node.name));
		$('#season_from_title').text('');
		$('#episode_from_title').text('');
	}
	else if (node.children) {
		//season
		$('#series_from_title').text(getSeriesName(node.parent.name));
		$('#season_from_title').text(node.name);
		$('#episode_from_title').text('');
	}
	else if (!node.children){
		$('#series_from_title').text(getSeriesName(node.parent.parent.name));
		$('#season_from_title').text(node.parent.name);
		$('#episode_from_title').text(node.name);
	}
	else {
		$('#series_from_title').text('?');
		$('#season_from_title').text('?');
		$('#episode_from_title').text('?');
	}	
}

function getParentIndex(s){
	if (s=='TOS') return 0;
	else if (s=='TNG') return 1;
	else if (s=='DS9') return 2;
	else if (s=='VOY') return 3;
	else if (s=='ENT') return 4;
}

function getColor(bar, index){
	if (bar.children){ //season
		if (bar.children[0].children){ //series
			return colors[index];
		}
		return colors[getParentIndex(bar.parent.name)];
	}
	else {
		return '#ccc';
	}
}

function getEpisodeHighlightColor(bar){
	return colors[getParentIndex(bar.parent.parent.name)];
}

function changeMode(){
	var series = $('#series_from_title').text();
	var season = $('#season_from_title').text();
	var episode = $('#episode_from_title').text();
	if (document.getElementById('RB_votes').checked) transitionVotesBarChart(series, season, episode);
  		else transitionRatingBarChart(series, season, episode);
}
	
function changeBarChartFocus(series, season, episode){
	if (document.getElementById('RB_votes').checked) transitionVotesBarChart(series, season, episode);
	else transitionRatingBarChart(series, season, episode);
}

/*jQuery.fn.d3Click = function () {
  this.each(function (i, e) {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

    e.dispatchEvent(evt);
  });
};*/

function changeFromLegend(abbr, i){
	render(inData.nodes[i],1);
	changeLineChartFocus(abbr, i);
	changeBarChartFocus(getSeriesName(abbr), '', '');
}