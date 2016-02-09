var games = require('./games.js');
var remote = require('remote');     

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
$(document).ready(function () {
	games.doGetGameDataAjax();
	setupWindowButtons();

	//handlers for gameplate scrolling
	$('#games--scroll-left').click(function(){
		games.scrollLeft();
	});
	$('#games--scroll-right').click(function(){
		games.scrollRight();
	});
});

/*
	window.setInterval()
	executes every gamePlateUpdateTime milliseconds.
*/
var gamePlateUpdateTime = 5000;
window.setInterval(function(){
	games.doGetGameDataAjax();
}, gamePlateUpdateTime);

