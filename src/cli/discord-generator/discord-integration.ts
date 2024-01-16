import {  Model } from '../../language/generated/ast.js'


export function generateAPI(model: Model) : void {
    const axios = require('axios');
    const discordWebhookUrl = 'https://discordapp.com/api/webhooks/1193905770450923581/E7QusUQtEdUgiWXDRssc1zRHbO5AfuSkXe_mjJHlrTLUTfFaTjtP8rufTQUMQJd7N0UC';
    const message = 'Notification message';

    axios.post(discordWebhookUrl, { content: message })
    .then(response => console.log('Notification sent to Discord'))
    .catch(error => console.error('Error sending notification:', error));
}
    



