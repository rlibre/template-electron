"use strict";

// Modules to control application life and create native browser window
const { app, dialog, BrowserWindow, Menu, ipcMain } = require('electron')

app.allowRendererProcessReuse = false;

const isMac = process.platform === 'darwin'




// ::  ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


/**
 * sync
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
 */

ipcMain.on( 'setTitle', (event, params) => {
	mainWindow.setTitle( params );
});

ipcMain.on( 'setIcon', (event, params) => {
	mainWindow.setIcon( params );
	event.returnValue = true;
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
	event.returnValue = true;
} );

/**
 * sync
 */

ipcMain.on( 'getPath', ( event, ptype ) => {
	event.returnValue = app.getPath( ptype );
});

/**
 * async
 */

ipcMain.on( "openDevTools", ( event, side ) => {
	mainWindow.webContents.openDevTools({ mode: side ?? 'bottom' } );
} );


/**
 * sync
 */

function makeMenu( data ) {

	let main = mainWindow.webContents;

	return data.map( (e) => {

		// popup menu
		if( e && e.label && e.submenu ) {

			return {
				label: e.label,
				submenu: e.submenu.map( item => {
					
					if( !item ) {
						return null;
					}

					if( item.submenu ) {
						const tmp = makeMenu( [item] );
						return tmp[0];
					}
					
					if( item.role ) {
						return item;
					}

					if( item.type && item.type=="separator") {
						return item;
					}
					
					if( item.action ) {
						let itm = {
							label: item.label,
							click: ( ) => { main.send( item.action, item.params ); }
						};

						if( item.checked!==undefined ) {
							itm.type = 'checkbox';
							itm.checked = item.checked;
						}

						return itm;
					}
				} ).filter( e => e!=null )
			};
		}
		else {
			return null;
		}

	}).filter( e => e!=null );
}

ipcMain.on( "setupMenus", ( event, data ) => {

	const template = makeMenu( data );
	appMmenu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(appMmenu);

	event.returnValue = true;
} );





// ::  ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::



let mainWindow = null;
let appMmenu = null;

function createMenus( browser ) {

	const template = [
		{
			label: 'Fichier',
			submenu: [
				{ role: 'toggleDevTools' },
				{ type: "separator" },
				{ label: 'Quitter', role: 'quit' },
			]
		},
	];

	appMmenu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(appMmenu);
}

async function createWindow() {
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
	});
	
	mainWindow.maximize();
		
	createMenus( mainWindow );

	// and load the index.html of the app.
	await mainWindow.loadFile('./index.html')

	process.nextTick( () => {
		mainWindow.show();
	} );

	mainWindow.webContents.on('context-menu', handleContextMenu);
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
	/*if (process.platform !== 'darwin')*/ app.quit()
})

// by default, electron do not show context menus
function handleContextMenu(event, props) {
	const win = mainWindow.webContents;

	const { editFlags } = props;
	const hasSelText = props.selectionText.trim().length > 0;
	
	let menu = []

	function word(suggestion) {
		return {
			id: 'dictionarySuggestions',
			label: suggestion,
			click(menuItem) {
				win.replaceMisspelling(menuItem.label);
			}
		};
	}

	if (props.isEditable && hasSelText && props.misspelledWord && props.dictionarySuggestions.length > 0) {
		menu = props.dictionarySuggestions.map(suggestion => word(suggestion) );
		menu.push( { type: "separator" } );
	}

	if (props.isEditable && hasSelText && editFlags.canCut ) {
		menu.push({
			id: 'cut',
			label: 'Cu&t',
			visible: props.isEditable,
			click(menuItem) {
				if (!menuItem.transform && win) {
					win.cut();
				}
				else {
					clipboard.writeText(props.selectionText);
				}
			}
		});
	}

	if (hasSelText && hasSelText && editFlags.canCopy ) {
		menu.push({
			id: 'copy',
			label: '&Copy',
			visible: props.isEditable || hasSelText,
			click(menuItem) {
				if (!menuItem.transform && win) {
					win.copy();
				}
				else {
					clipboard.writeText(props.selectionText);
				}
			}
		});
	}

	if( props.isEditable && editFlags.canPaste) {
		menu.push({
			id: 'paste',
			label: '&Paste',
			click(menuItem) {
				if (menuItem.transform) {
					let clipboardContent = clipboard.readText(props.selectionText);
					win.insertText(clipboardContent);
				}
				else {
					win.paste();
				}
			}
		});

	}

	//	services: {
	//		id: 'services',
	//			label: 'Services',
	//				role: 'services',
	//					visible: process.platform === 'darwin' && (props.isEditable || hasText)
	//	}
	//};

	//let menuTemplate = [
	//	...dictionarySuggestions,
	//	defaultActions.cut,
	//	defaultActions.copy,
	//	defaultActions.paste,
	//	//options.showServices && defaultActions.services,
	//];

	if (menu.length > 0) {
		const ctxmenu = Menu.buildFromTemplate(menu);
		ctxmenu.popup(win);
	}
}
