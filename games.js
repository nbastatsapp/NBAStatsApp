/*
*    games.js
*
*    This file controls the games/gameplates module at the top of the nba stats app
*/

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
	var gamesContainer = document.getElementById('gameplate-wrapper');
	gamesContainer.innerHTML = '';
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

function getElementPosition(el)
{
	for (var lx=0, ly=0;
         el != null;
         lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
    return {x: lx,y: ly};
}

function isAllowedToScroll(direction)
{
	if(direction == 'left')
	{
		var firstGamePlate = document.getElementsByClassName('gameplate')[0];
		var pos = getElementPosition(firstGamePlate);
		if( pos.x <= 30 )
		{
			if(pos.x >= -98)
			{
				if(pos.x < 0)
				{
					var goalStoppingPoint = 30;
					var currentPoint = pos.x;
					var calculatedMoveDistance = Math.abs(currentPoint) + goalStoppingPoint + 5;
					var distanceStr = '+=' + calculatedMoveDistance;
					return {canscroll: true, distance: distanceStr};
				}
				else
				{
					var calculatedMoveDistance = 30 - pos.x + 5;
					var distanceStr = '+=' + calculatedMoveDistance;
					return {canscroll: true, distance: distanceStr};
				}
			}
			return {canscroll: true, distance: '+=128'};
		}
		else
		{
			return {canscroll: false, distance: ''};
		}
	}
	else if(direction == 'right')
	{
		
		var lastGamePlateArr = document.getElementsByClassName('gameplate');
		var lastGamePlate = lastGamePlateArr[lastGamePlateArr.length - 1];
		var pos = getElementPosition(lastGamePlate);
		if(pos.x + 120 >= $(window).width() - 30)
		{
			if(pos.x + 120 <= $(window).width() +98 )
			{
				var goalStoppingPoint = $(window).width() - 30;
				var currentPoint = pos.x + 120;
				var calculatedMoveDistance = currentPoint - goalStoppingPoint + 1 + 5;
				var distanceStr = '-=' + calculatedMoveDistance;
				return {canscroll: true, distance: distanceStr};
			}
			return {canscroll: true, distance: '-=128'};
		}
		else
		{
			return {canscroll: false, distance: ''};
		}
	}
	return {canscroll: false, distance: ''}
}

var animating = false;
function scrollLeft()
{
	var canScroll = isAllowedToScroll('left');
	if(!animating && canScroll.canscroll)
	{
		animating = true;
		$("#gameplate-wrapper").animate({marginLeft: canScroll.distance}, 'fast', function(){
			animating = false;
		});
	}
}

function scrollRight()
{
	var canScroll = isAllowedToScroll('right');
	if(!animating && canScroll.canscroll)
	{
		animating = true;
		$("#gameplate-wrapper").animate({marginLeft: canScroll.distance}, 'fast', function(){
			animating = false;
		});
	}
}





//export functions needed in other files
module.exports = {
    doGetGameDataAjax: doGetGameDataAjax,
    scrollLeft: scrollLeft,
    scrollRight: scrollRight
};


