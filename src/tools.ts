// while x4electron is a wip
/// <reference types="electron" />

declare function require( name );

const renderer = require( "electron/renderer" ) as typeof Electron.Renderer;
const fs = require('fs');

export function getElectronIPC( ) {
	return renderer;
}

export function defineElectronHandler( channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) {
	renderer.ipcRenderer.on( channel, listener );
}

/**
 * @returns the content of package.json
 */

export function getPackage( ) {
	return JSON.parse(fs.readFileSync('package.json', 'utf8'))
}



/**
 * @example
 * {
 * 	'packed file' : 'report'
 * 	'json file': 'report.json'
 * }
 */

 interface OpenSaveFilter {
	[name: string]: string | string[]; // 
}



/**
 * show openfile dialog
 * @param ext - string - ex: '.doc,.docx'
 * @param cb - callback to call when user select a file
 */

export function openFile( ext: OpenSaveFilter, cb: ( filename: string ) => void, multiple = false ) {

	const filters: any[] = [];
	for( const n in ext ) {

		let f: string[];
		if( !Array.isArray(ext[n]) ) {
			f = [ ext[n] as string ];
		}
		else {
			f = ext[n] as string[];
		}

		filters.push( { name: n, extensions: f } );
	}
	
	let result = renderer.ipcRenderer.sendSync( 'showOpenDialog', {
		filters,
		multiple
	} );

	console.log( result );
	if( result ) {
		cb( result );
	}
}

/**
 * open saveas dialog
 * @param defFileName - string - proposed filename 
 * @param cb - callback to call when user choose the destination
 */

export function saveFile( defFileName: string, ext: OpenSaveFilter, cb: (filename: string ) => void ) {

	const ipcRenderer = getElectronIPC( );

	const filters: any[] = [];
	for( const n in ext ) {
		filters.push( { name: n, extensions: [ext[n]] } );
	}

	let result = renderer.ipcRenderer.sendSync( 'showSaveDialog', {
		defaultPath: defFileName,
		filters
	} );

	console.log( result );
	if( result ) {
		cb( result );
	}
}
