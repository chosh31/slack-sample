const { RTMClient } = require('@slack/rtm-api');
const { google } = require('googleapis');
const credentials = require('./credentials.json');
// const token = 'xoxb-646983565972-651803858726-p8NnQTAW8QQamGjleZ5v93y6'; // amy
const token = 'xoxb-638617199442-650056991104-5ivU5aZUtDQnhD3eMDlWuEAz';

const rtm = new RTMClient(token);

rtm.on('message', event => {
    console.info(event);
    const { text, channel } = event;
    // if (text.includes('@UK41NV532')) {
    //     rtm.sendMessage(text.split('>')[1], channel);
    // }
});

(async () => {
    // Connect to Slack
    await rtm.start();
})();

class GoogleDriveManager {
    constructor() {
        let authScopes = [
            'https://www.googleapis.com/auth/spreadsheets'
        ];
        
        this.jwtClient = new google.auth.JWT(
            credentials.client_email,
            null,
            // null,
            credentials.private_key,
            authScopes
        );
    }

    prepareNewSheet() {
        return this._authorizeGoogleClient()
            .then(() => this._readSheet());
    }

    _authorizeGoogleClient() {
        console.log('_authorizeGoogleClient');
        return this.jwtClient.authorize();
    }

    _readSheet() {
        return new Promise((res, rej) => {
            this.sheetClient = google.sheets({
                version: 'v4',
                auth: this.jwtClient
            });

            const request = {
                spreadsheetId: credentials.spreadsheetId,
                range: 'A1',
                valueRenderOption: 'UNFORMATTED_VALUE',
                dateTimeRenderOption: 'FORMATTED_STRING',
                auth: this.jwtClient,
            };
            
            this.sheetClient.spreadsheets.values.get(request, function(err, response) {
                console.log(`read!!`);
                if (err) {
                    console.log(11);
                    console.error(err);
                    return;
                }
            
                // TODO: Change code below to process the `response` object:
                console.log(response);

                res();
            });
        })
        
    }
}

(async () => {
    const gdm = new GoogleDriveManager();
    console.log(gdm.jwtClient);

    gdm.prepareNewSheet();
})();