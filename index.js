var app = require('app');
var BrowserWindow = require('browser-window');

app.on('ready', function() {
	var mainWindow = new BrowserWindow({
		width: 1200,
		height: 800
	});
	mainWindow.loadURL('file://' + __dirname + '/index.html');
});