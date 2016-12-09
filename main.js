'use strict';
const {app, BrowserWindow, ipcMain, Menu, Tray} = require('electron');
var fs = require('fs');
var window = null;
let tray = null
app.on('ready', () => {
	let win = new BrowserWindow({width: 700, height: 150, transparent: true,frame: false,title: app.getName(),icon:"icon.png",});
	window = win;
	if (fs.existsSync('bootstrap.txt')) {
		window.loadURL('file://' + __dirname + '/app/service.html');
		window.hide();
	}else{
		window.loadURL('file://' + __dirname + '/app/index.html');
	}
});
app.on('quit', () => {if(tray){tray.destroy();}});
ipcMain.on('close', (event, arg) => { app.quit(); });
ipcMain.on('finish', (event, arg) => {
	console.log("Bootstrap Finished.");
	fs.open('bootstrap.txt','r',function(err, fd){
		if (err) {fs.writeFile('bootstrap.txt', (+new Date), function(err) {if(err) {console.error(err);}});}
	});
	window.hide();
	window.loadURL('file://' + __dirname + '/app/service.html');
});
ipcMain.on('errorCollect', (event, arg) => {
	console.log(arg);
});
app.on('ready', () => {
	tray = new Tray('icon.png')
	tray.setToolTip(app.getName())
	tray.on('click', () => {
		window.isVisible() ? window.hide() : window.show()
	})
})

