var remote = require('remote');     

/*
	constructGameDataUrl()
	Constructs the ajax url for acquiring current game data
*/
function constructGameDataUrl()
{
	var dateInfo = new Date();
	var month = dateInfo.getMonth() + 1;
	var day = dateInfo.getDate();
	var year = dateInfo.getFullYear();

	if(month < 10)
	{
		month = "0" + month;
	}
	if(day < 10)
	{
		day = "0" + day;
	}

	var dateStr = month + '/' + day + '/' + year;
	return 'http://stats.nba.com/stats/scoreboardV2?DayOffset=0&LeagueID=00&gameDate=' + dateStr;

}

/*
	doGetGameDataAjax()
	performs the ajax request for game data and reroutes data for processing
*/
function doGetGameDataAjax()
{

	var url = constructGameDataUrl();

	$.ajax(
	{
		type: 'GET',
		url: url,
		dataType: "jsonp",
		success: function (data) 
		{
			processGameData(data);
		},
		error: function(data)
		{
			alert('Something bad happened trying to get game data.');
		}
	});
}

/*
	getGameDataJsonFragment()
	returns the index of the json object that matches the passed in name
*/
function getGameDataJsonFragment(arrayName, data)
{
	//eg: GameHeader, LineScore
	for(var i = 0; i < data.resultSets.length; i++)
	{
		if(data.resultSets[i].name == arrayName)
		{
			return i;
		}
	}
	return -1;
}

/*
	getIndexFromHeaderArray()
	returns the index of the data piece you want that cooresponds with the header
*/
function getIndexFromHeaderArray(headerArray, headerName)
{
	//pass in data.resultSets[theIndexYouWant].headers
	for(var i = 0; i < headerArray.length; i++)
	{
		if(headerArray[i] == headerName)
		{
			return i;
		}
	}
	return -1;
}

/*
	getScoresFromTeamNamePair()
	returns the score of the two passed in teams
*/
function getScoreFromTeamNamePair(awayTeam, homeTeam, data)
{
	var idx = getGameDataJsonFragment('LineScore', data);
	var abbrIdx = getIndexFromHeaderArray(data.resultSets[idx].headers, 'TEAM_ABBREVIATION');
	var ptsIdx = getIndexFromHeaderArray(data.resultSets[idx].headers, 'PTS');

	var awayScore;
	var homeScore;
	for(var i = 0; i < data.resultSets[idx].rowSet.length; i++)
	{		
		if(data.resultSets[idx].rowSet[i][abbrIdx] == awayTeam)
		{
			awayScore = data.resultSets[idx].rowSet[i][ptsIdx];
		}
		else if(data.resultSets[idx].rowSet[i][abbrIdx] == homeTeam)
		{
			homeScore = data.resultSets[idx].rowSet[i][ptsIdx];
		}

		if(!!awayScore && !!homeScore)
		{
			break;
		}
	}

	//if both are -1, the game hasn't started yet
	if(!awayScore && !homeScore)
	{
		awayScore = '&#8213;';
		homeScore = '&#8213;';
	}

	var scoreObj = {};
	scoreObj.awayscore = String(awayScore);
	scoreObj.homescore = String(homeScore);

	return scoreObj;
}

/*
	processGameData()
	processes the data obtained in the game data ajax response
*/
function processGameData(data)
{
	//first, let's clear out the current game plates
	document.getElementById('games').innerHTML = '';

	var gamesContainer = document.getElementById('games');
	var idx = getGameDataJsonFragment('GameHeader', data);

	for(var i = 0; i < data.resultSets[idx].rowSet.length; i++)
	{
		//create team vs team text
		var teamVsTeam = data.resultSets[idx].rowSet[i][5];
		teamVsTeam = teamVsTeam.substring(teamVsTeam.indexOf('/') + 1);
		var awayTeam = teamVsTeam.substring(0, 3);
		var homeTeam = teamVsTeam.substring(3);
		teamVsTeam = awayTeam + ' <span class="at">@</span> ' + homeTeam;
		var tvtEle = document.createElement('h3');
		tvtEle.innerHTML = teamVsTeam;
		
		//get those teams' current scores
		var score = getScoreFromTeamNamePair(awayTeam, homeTeam, data);
		var scoreEle = document.createElement('h3');
		scoreEle.innerHTML = score.awayscore + '&nbsp;&nbsp;-&nbsp;&nbsp;' + score.homescore;

		//get the game status (Q1, Q3, FINAL, etc)
		var gameStatIdx = getIndexFromHeaderArray(data.resultSets[idx].headers, 'GAME_STATUS_TEXT');
		var gameStatus = data.resultSets[idx].rowSet[i][gameStatIdx];
		var gameStatEle = document.createElement('p');
		gameStatEle.innerHTML = gameStatus;

		//get the period time
		var gameTimeIdx = getIndexFromHeaderArray(data.resultSets[idx].headers, 'LIVE_PC_TIME');
		var gameTime = data.resultSets[idx].rowSet[i][gameTimeIdx];
		var gameTimeEle = document.createElement('p');
		if(!gameTime.trim())
		{
			gameTime = ' - -  :  - - ';
		}
		gameTimeEle.innerHTML = gameTime;

		//bottom padding for the plate
		var paddingEle = document.createElement('div');
		paddingEle.className = 'gameplate--padding';

		//create two divs for the team logos
		// var awayLogoEle = document.createElement('div');
		// var homeLogoEle = document.createElement('div');
		// var awayImg = 'http://z.cdn.turner.com/nba/nba/.element/img/4.0/global/logos/512x512/bg.white/svg/' + awayTeam + '.svg';
		// var homeImg = 'http://z.cdn.turner.com/nba/nba/.element/img/4.0/global/logos/512x512/bg.white/svg/' + homeTeam + '.svg';
		// awayLogoEle.className = 'awaylogo';
		// homeLogoEle.className = 'homelogo';
		// awayLogoEle.style.backgroundImage = 'url("http://z.cdn.turner.com/nba/nba/.element/img/4.0/global/logos/512x512/bg.white/svg/NYK.svg")';
		// homeLogoEle.style.backgroundImage = 'url("http://z.cdn.turner.com/nba/nba/.element/img/4.0/global/logos/512x512/bg.white/svg/NYK.svg")';

		//create game plate
		var gamePlate = document.createElement('a');

		//append all of the information elements
		gamePlate.appendChild(tvtEle);
		gamePlate.appendChild(scoreEle);
		gamePlate.appendChild(gameStatEle);
		gamePlate.appendChild(gameTimeEle);
		gamePlate.appendChild(paddingEle);
		// gamePlate.appendChild(awayLogoEle);
		// gamePlate.appendChild(homeLogoEle);

		gamePlate.className = 'gameplate';
		gamePlate.href = "#";
		gamesContainer.appendChild(gamePlate);
	}

}

/*
	setupWindowButtons()
	adds event listeners to close, minimize, and maximize buttons
*/
function setupWindowButtons()
{
	document.getElementById("min-btn").addEventListener("click", function (e) {
	   var window = remote.getCurrentWindow();
	   window.minimize(); 
	});

	document.getElementById("max-btn").addEventListener("click", function (e) {
	   var window = remote.getCurrentWindow();
	   window.maximize(); 
	});

	document.getElementById("close-btn").addEventListener("click", function (e) {
	   var window = remote.getCurrentWindow();
	   window.close();
	}); 
}

/*
	window.onload()
	executes once on page load
*/
window.onload = function(){
	doGetGameDataAjax();
	setupWindowButtons();
}

/*
	window.setInterval()
	executes every gamePlateUpdateTime milliseconds.
*/
var gamePlateUpdateTime = 5000;
window.setInterval(function(){
	doGetGameDataAjax();
}, gamePlateUpdateTime);

