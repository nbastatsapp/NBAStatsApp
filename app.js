function ajaxGET(url)
{

	$.ajax(
	{
		type: 'GET',
		url: url,
		dataType: "jsonp",
		success: function (data) 
		{
			document.write(JSON.stringify(data));
		}
	});
}

function test()
{	
	ajaxGET('http://stats.nba.com/stats/scoreboardV2?DayOffset=0&LeagueID=00&gameDate=02%2F01%2F2016');
}