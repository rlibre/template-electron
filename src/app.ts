// import required elements
import { installHMR, sendAsyncIPC } from 'x4electron';
import { Application, VLayout, Label } from 'x4js'

// create the application
let app = new Application( {
	app_name: "template",
	app_version: "1.0.0"
} );

// create the main frame
let frame = new VLayout( {
    content: [
        new Label( { text: "Your app is running" } ) // a small button
    ]
});

// define it as the app main frame.
app.mainView = frame;

declare const DEBUG;
if( DEBUG ) {
	installHMR()	
	sendAsyncIPC("openDevTools");
}


