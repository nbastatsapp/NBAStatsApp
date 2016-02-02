/*
	constructGameDataUrl()
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
*/
function doGetGameDataAjax()
{

	var url = constructGameDataUrl();

	$.ajax(
	{
		type: 'GET',
		url: url,
		dataType: "jsonp",
		async: false,
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
		awayScore = '--';
		homeScore = '--';
	}

	var scoreObj = {};
	scoreObj.awayscore = String(awayScore);
	scoreObj.homescore = String(homeScore);

	return scoreObj;
}

/*
	processGameData()
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

		//create game plate
		var gamePlate = document.createElement('a');

		//append all of the information elements
		gamePlate.appendChild(tvtEle);
		gamePlate.appendChild(scoreEle);
		gamePlate.appendChild(gameStatEle);
		gamePlate.appendChild(gameTimeEle);
		gamePlate.appendChild(paddingEle);

		gamePlate.className = 'gameplate';
		gamePlate.href = "#";
		gamesContainer.appendChild(gamePlate);
	}

}

/*
	window.onload()
*/
window.onload = function(){
	doGetGameDataAjax();
}

/*
	window.setInterval()
*/
window.setInterval(function(){
	doGetGameDataAjax();
}, 5000);

