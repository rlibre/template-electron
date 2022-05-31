"use strict";

// Modules to control application life and create native browser window
const { app, dialog, BrowserWindow, Menu, ipcMain } = require('electron')

const isMac = process.platform === 'darwin'


// ::  ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


/**
 * sync
 * show open dialog box
 */

 ipcMain.on( 'showOpenDialog', ( event, params ) => {
	
	console.log( params.filter );
	const filenames = dialog.showOpenDialogSync( {
		properties: ['openFile'],
		filters: params.filters
	} );

	event.returnValue = filenames;
})

/**
 * sync
 * show save dialog box
 */

ipcMain.on( 'showSaveDialog', ( event, params ) => {
	
	console.log( params.filter );
	const filenames = dialog.showSaveDialogSync( {
		properties: ['openFile'],
		filters: params.filters,
		defaultPath: params.defaultPath,
	} );

	event.returnValue = filenames;
})

/**
 * async
 * change the window title
 */

ipcMain.on( 'setTitle', (event, params) => {
	mainWindow.setTitle( params );
});


/**
 * async
 */

ipcMain.on( 'enableMenubar', (event, enable ) => {

	function enableMenu( menu ) {
		if( menu.items ) {
			menu.items.forEach( ( mi ) => {
				if( mi.submenu ) {
					enableMenu( mi.submenu );
				}

				mi.enabled = enable;
			});
		}
	}

	enableMenu( appMmenu );
} );

/**
 * sync
 */

ipcMain.on( 'getPath', ( event, ptype ) => {
	event.returnValue = app.getPath( ptype );
});






// ::  ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::



let mainWindow = null;
let appMmenu = null;

function createMenus( browser ) {

	let view = browser.webContents;

	const template = [
		// { role: 'appMenu' }
		...(isMac ? [{
			label: app.name,
			submenu: [
				{ role: 'about' },
				{ type: 'separator' },
				{ role: 'services' },
				{ type: 'separator' },
				{ role: 'hide' },
				{ role: 'hideothers' },
				{ role: 'unhide' },
				{ type: 'separator' },
				{ role: 'quit' }
			]
		}] : []),

		// { role: 'fileMenu' }
		{
			label: 'File',
			submenu: [
				{ label: 'Open', click: ( ) => view.send( 'openFile' ) },
				{ label: 'New', click: ( ) => view.send( 'createFile' ) },
				{ label: 'Save', click: ( ) => view.send( 'save' ) },
				{ label: 'Save As', click: ( ) => view.send( 'saveAs' ) },
				{ type: 'separator' },
				{ label: 'Preferences', click: ( ) => view.send( 'preferences' ) },
				{ type: 'separator' },
				{ label: 'Exit', role: 'quit' },
			]
		},

		{
			label: 'View',
			submenu: [
				{ role: 'toggleDevTools' },
				{ role: 'togglefullscreen' }
			]
		},
				
		{
			role: 'help',
			submenu: [
				{
					label: 'About',
					click: ( ) => view.send( 'about' ),
				}
		  	]
		}
	]

	appMmenu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(appMmenu);
}

function createWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		show: false,
		webPreferences: {
			//preload: path.join(__dirname, 'preload.js')
			nodeIntegration: true,
			contextIsolation: false,
		}
	})
	

	createMenus( mainWindow );

	// and load the index.html of the app.
	mainWindow.loadFile('index.html')
	process.nextTick(() => {
		mainWindow.maximize();
		mainWindow.show();
	});


	// Open the DevTools.
	mainWindow.webContents.openDevTools({ mode: 'detach' })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow()

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
})

