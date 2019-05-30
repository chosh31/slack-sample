const { RTMClient } = require('@slack/rtm-api');
const token = 'xoxb-646983565972-651803858726-p8NnQTAW8QQamGjleZ5v93y6'; // amy
const rtm = new RTMClient(token);

rtm.on('message', event => {
    console.info(event);
    const { text, channel } = event;
    if (text.includes('@UK5PMR8MC')) {
        rtm.sendMessage(text.split('>')[1], channel);
    }
});

(async () => {
    // Connect to Slack
    await rtm.start();
})();
