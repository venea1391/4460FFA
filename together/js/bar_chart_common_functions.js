var colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", '#ccc'];

function setTitleText(node){
	if (node.children && node.children[0].children && node.children[0].children[0].children) {
		$('#series_from_title').text('');
		$('#season_from_title').text('');
	}
	else if (node.children && node.children[0].children) {
		//series
		$('#series_from_title').text(getSeriesName(node.name));
		$('#season_from_title').text('');
	}
	else if (node.children) {
		//season
		$('#series_from_title').text(getSeriesName(node.parent.name));
		$('#season_from_title').text(node.name);
	}
	else {
		$('#series_from_title').text('?');
		$('#season_from_title').text('?');
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