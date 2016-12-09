'use strict';
const {app, BrowserWindow, ipcMain, Menu, Tray} = require('electron');
var serialNumber = require('serial-number');
var window = null;
var SNID = null;
let tray = null

app.on('ready', () => {
	let win = new BrowserWindow({width: 700, height: 150, transparent: true,frame: false,title: app.getName(),icon:"icon.png",});
	window = win;
	window.loadURL('file://' + __dirname + '/app/index.html');
	tray = new Tray('icon.png')
	tray.setToolTip(app.getName())
	tray.on('click', () => {window.isVisible() ? window.hide() : window.show()})
});
app.on('quit', () => {if(tray!=null){tray.destroy();}});
ipcMain.on('close', (event, arg) => { app.quit(); });
ipcMain.on('finish', (event, arg) => {
	console.log("Bootstrap Finished.");
	//window.hide();
	window.loadURL('file://' + __dirname + '/app/service.html');
});
ipcMain.on('errorCollect', (event, arg) => {console.log(arg);});
ipcMain.on('sendSNID', (event, arg) => {
	if(arg!=null){SNID=arg;}
	console.log(SNID);
	window.webContents.send('getSNID', SNID);
});