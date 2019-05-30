const { RTMClient } = require('@slack/rtm-api');
const { google } = require('googleapis');
const credentials = require('./credentials.json');
// const token = 'xoxb-646983565972-651803858726-p8NnQTAW8QQamGjleZ5v93y6'; // amy
const token = 'xoxb-638617199442-650056991104-81W0mVPjxkjHk6mc3om1TLVH';

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
    // class GoogleDriveManager {
    constructor() {
        let authScopes = [
            'https://www.googleapis.com/auth/spreadsheets'
            // 'https://www.googleapis.com/auth/drive.file'
        ];
        
        this.jwtClient = new google.auth.JWT(
            credentials.client_email,
            null,
            credentials.private_key,
            authScopes
        );

        (async () => {
            this.jwtClient.authorize();
            console.log(`jwtClient :: authorized!!`);
        })();
        
        this.sheetClient = google.sheets({
            version: 'v4',
            auth: this.jwtClient
        });
    }

    getSheetData() {
        var request = {
            // The ID of the spreadsheet to retrieve data from.
            spreadsheetId: '1y790I47ebDkX_7hIEeH2HUTbj_1lLDscn6WfHMZsuHg',  // TODO: Update placeholder value.
        
            // The A1 notation of the values to retrieve.
            range: 'my-range',  // TODO: Update placeholder value.
        
            // How values should be represented in the output.
            // The default render option is ValueRenderOption.FORMATTED_VALUE.
            valueRenderOption: '',  // TODO: Update placeholder value.
        
            // How dates, times, and durations should be represented in the output.
            // This is ignored if value_render_option is
            // FORMATTED_VALUE.
            // The default dateTime render option is [DateTimeRenderOption.SERIAL_NUMBER].
            dateTimeRenderOption: '',  // TODO: Update placeholder value.
        
            auth: this.jwtClient,
        };
        
        this.sheetClient.spreadsheets.values.get(request, function(err, response) {
            if (err) {
                console.error(err);
                return;
            }
        
            // TODO: Change code below to process the `response` object:
            console.log(JSON.stringify(response, null, 2));
        });
    }
}

const gdm = new GoogleDriveManager();
console.log(gdm.jwtClient);

gdm.getSheetData();