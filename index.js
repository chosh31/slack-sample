const { RTMClient } = require('@slack/rtm-api');
const { google } = require('googleapis');
const credentials = require('./credentials.json');
const token = credentials.slack_token;
const rtm = new RTMClient(token);

class GoogleDriveManager {
    constructor() {
        let authScopes = [
            'https://www.googleapis.com/auth/spreadsheets'
        ];
        
        this.jwtClient = new google.auth.JWT(
            credentials.client_email,
            null,
            credentials.private_key,
            authScopes
        );
    }

    getSheetCommands(channel) {
        return this._authorizeGoogleClient()
            .then(() => this._readSheet('Sheet1!A2:A', channel));
    }

    getKeywordRow(keyword, spreadSheetValues) {
        const keywordElement = spreadSheetValues.find(row => {
            const keywords = row[0].split(',');
            return keywords.find(keywordInSheet => keywordInSheet.includes(keyword));
        });
    
        if (keywordElement) return spreadSheetValues[spreadSheetValues.indexOf(keywordElement)][1];
        return '없는 키워드 입니다 ㅠ';
    }

    getSheetData(channel, command) {
        return this._authorizeGoogleClient()
            .then(() => this._readSheet('Sheet1!A2:B', channel, command));
    }

    _parseSheetData(res) {
        return res.data.values.map((d) => {
            return `\`${d[0]}\``;
        })
    }


    _authorizeGoogleClient() {
        console.log('_authorizeGoogleClient');
        return this.jwtClient.authorize();
    }

    _readSheet(range, channel, command) {
        return new Promise((res, rej) => {
            this.sheetClient = google.sheets({
                version: 'v4',
                auth: this.jwtClient
            });

            const request = {
                spreadsheetId: credentials.spreadsheetId,
                range: range,
                valueRenderOption: 'UNFORMATTED_VALUE',
                dateTimeRenderOption: 'FORMATTED_STRING',
                auth: this.jwtClient,
            };
            
            this.sheetClient.spreadsheets.values.get(request, (err, response) => {
                if (err) {
                    console.error(err);
                    return;
                }

                // console.log(response);
                let ret;
                if (command) {
                    ret = this.getKeywordRow(command, response.data.values);
                } else {
                    ret = this._parseSheetData(response).join(',');
                }
                rtm.sendMessage(ret, channel);
                res();
            });
        })
        
    }
}

const gdm = new GoogleDriveManager();

rtm.on('message', event => {
    console.info(event);
    const { text, channel } = event;
    if (text === undefined) return;

    if (text.includes('@UK41NV532')) {
        if (text.includes('help')) {
            gdm.getSheetCommands(channel);
        } else {
            const command = text.split('>')[1].trim();
            gdm.getSheetData(channel, command);
        }
    }
});

(async () => {
    // Connect to Slack
    await rtm.start();
})();
