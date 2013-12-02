/* All code in this file is from scratch */

/* color array for the 5 series and the gray bars */
var colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", '#ccc'];

/* Sets the title text of the bar chart */
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

/* gets the index of that series in the color array */
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

/* Changes bar chart mode based on radio button - rating or number of votes */
function changeMode(){
	var series = $('#series_from_title').text();
	var season = $('#season_from_title').text();
	var episode = $('#episode_from_title').text();
	if (document.getElementById('RB_votes').checked) transitionVotesBarChart(series, season, episode);
  		else transitionRatingBarChart(series, season, episode);
  	$('html,body').animate({
        scrollTop: $("#barchart_outer_div").offset().top},
        'slow');

}
	
/* Same as changeMode but series (name, not abbr), season, and episode are given as arguments */
function changeBarChartFocus(series, season, episode){
	if (document.getElementById('RB_votes').checked) transitionVotesBarChart(series, season, episode);
	else transitionRatingBarChart(series, season, episode);
}

/* Updates bar chart and line graph from series listed in legend */
function changeFromLegend(abbr, i){
	render(inData.nodes[i],1);
	changeLineChartFocus(abbr, i);
	changeBarChartFocus(getSeriesName(abbr), '', '');
}