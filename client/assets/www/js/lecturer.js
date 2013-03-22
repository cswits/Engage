var lecturer_grapher;
var myArr= [[2,5.12,13.1,33.6,85.9,219.9]];

function lecturer_newlecture_init(){
}

function lecturer_watchlecture_init(){
	lecturer_grapher=setInterval(lecturer_drawgraph,1000);
}

function lecturer_startdrawing(){
	
}

function lecturer_drawgraph(){
	$.jqplot('chartdiv', myArr, {
      title: 'Engagement',
      series:[{
		markerOptions:{ show:false}
	
	}]
      
    });
	myArr[0].push(100);
	myArr[0].shift();
}

function lecturer_endlecture(){
	clearTimeout(lecturer_grapher);
	$.mobile.changePage("#lecturer_newlecture_page");
}

function login_init(){
}
