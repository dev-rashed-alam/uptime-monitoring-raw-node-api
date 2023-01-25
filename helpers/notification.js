const https = require('https');
const querystring = require('querystring');
const { twilio } = require('./environments');

const notifications = {};

notifications.sendTwilioSms = (phone, message, callback) => {
    const userPhone =
        typeof phone === 'string' && phone.trim().length === 11 ? phone.trim() : false;

    const userMsg =
        typeof message === 'string' && message.trim().length > 0 ? message.trim() : false;

    if (userPhone && userMsg) {
        const payload = {
            From: twilio.fromPhone,
            Body: `${userMsg}`,
            To: `+88${phone}`,
        };

        const stringifyPayload = querystring.stringify(payload);

        const requestDetails = {
            hostname: `api.twilio.com`,
            path: `/2010-04-01/Accounts/${twilio.accountSID}/Messages.json`,
            method: 'POST',
            auth: `${twilio.accountSID}:${twilio.authToken}`,
            headers: {
                'Content-type': 'application/x-www-form-urlencoded',
            },
        };

        const req = https.request(requestDetails, (res) => {
            const { statusCode } = res;
            if (statusCode === 200 || statusCode === 201) {
                callback(false);
            } else {
                callback(`Status code return was ${statusCode}`);
            }
        });
        req.on('error', (e) => {
            callback(e.message);
        });
        req.write(stringifyPayload);
        req.end();
    } else {
        callback('Missing peremeter!');
    }
};

module.exports = notifications;
