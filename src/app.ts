// import required elements
import { Application, VLayout, Label } from 'x4js'
import { defineElectronHandler, getPackage, openFile } from "./tools"

function showNotImp( ) {
	alert( "Not implemented..." );
}

function checkOpenFile( ) {
	openFile( { 
		textFile: "txt", 
		all: "*"
	}, ( f ) => {
		alert( f );
	});
}

// called from electron app
defineElectronHandler( 'openFile', ( ) => checkOpenFile() );
defineElectronHandler( 'createFile', ( ) => showNotImp() );
defineElectronHandler( 'save', ( ) => showNotImp() );
defineElectronHandler( 'saveAs', ( ) => showNotImp() );
defineElectronHandler( 'preferences', ( ) => showNotImp() );
defineElectronHandler( 'about', ( ) => showNotImp() );


const pkg = getPackage( );

// create the application
let app = new Application( {
	app_name: pkg.title,
	app_version: pkg.version
} );

// create the main frame
let frame = new VLayout( {
    content: [
        new Label( { text: "Your app is running. Just try File/open to see link with electron" } ) // a small button
    ]
});

// define it as the app main frame.
app.mainView = frame;
