const url = require('url');
const http = require('http');
const https = require('https');
const data = require('./data');
const { parseJson } = require('../helpers/utils');
const { sendTwilioSms } = require('../helpers/notification');

const worker = {};

worker.alertUserToStatusChange = (newCheckData) => {
    const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${
        newCheckData.protocol
    }://${newCheckData.url} is currently ${newCheckData.state}`;

    sendTwilioSms(newCheckData.phone, msg, (err) => {
        if (!err) {
            console.log(`User was alerted to a status change via sms: ${msg}`);
        } else {
            console.log('There was a problem sending sms to one of the user!');
        }
    });
};

worker.processCheckOutcome = (orginalCheckData, checkOutCome) => {
    const state =
        !checkOutCome.error &&
        checkOutCome.responseCode &&
        orginalCheckData.successCodes.includes(checkOutCome.responseCode)
            ? 'up'
            : 'down';

    console.log(
        state,
        checkOutCome.responseCode,
        orginalCheckData.successCodes,
        orginalCheckData.successCodes.includes(checkOutCome.responseCode)
    );

    const alertWanted = !!(orginalCheckData.lastChecked && orginalCheckData.state !== state);

    const newCheckData = orginalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    data.update('checks', newCheckData.id, newCheckData, (err) => {
        if (!err) {
            if (alertWanted) {
                worker.alertUserToStatusChange(newCheckData);
            } else {
                console.log('Alert is not needed as there is no status change');
            }
        } else {
            console.log('Error: trying to save check data of one of the checks!');
        }
    });
};

worker.performCheck = (orginalCheckData) => {
    let checkOutCome = {
        error: false,
        responseCode: false,
    };

    let outcomeSent = false;

    const parsedUrl = url.parse(`${orginalCheckData.protocol}://${orginalCheckData.url}`, true);
    const { hostname } = parsedUrl;
    const { path } = parsedUrl;

    const requestProperties = {
        protocol: `${orginalCheckData.protocol.toLowerCase()}:`,
        hostname,
        path,
        method: orginalCheckData.method.toUpperCase(),
        timeout: orginalCheckData.timeoutSeconds * 1000,
    };

    const protocolToUse = orginalCheckData.protocol.toLowerCase() === 'http' ? http : https;

    const req = protocolToUse.request(requestProperties, (response) => {
        const status = response.statusCode;

        checkOutCome.responseCode = status;

        if (!outcomeSent) {
            worker.processCheckOutcome(orginalCheckData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.on('error', (e) => {
        checkOutCome = {
            error: true,
            value: e,
        };
        if (!outcomeSent) {
            worker.processCheckOutcome(orginalCheckData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.on('timeout', () => {
        checkOutCome = {
            error: true,
            value: 'timeout',
        };
        if (!outcomeSent) {
            worker.processCheckOutcome(orginalCheckData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.end();
};

worker.validateCheckData = (checkData) => {
    const orginalCheckData = checkData;
    if (orginalCheckData && orginalCheckData.id) {
        orginalCheckData.state =
            typeof orginalCheckData.state === 'string' &&
            ['up', 'down'].includes(orginalCheckData.state)
                ? orginalCheckData.state
                : 'down';
        orginalCheckData.lastChecked =
            typeof orginalCheckData.lastChecked === 'number' && orginalCheckData.lastChecked > 0
                ? orginalCheckData.lastChecked
                : false;

        worker.performCheck(orginalCheckData);
    } else {
        console.log('Check was invalid or not properly formated!');
    }
};

worker.gatherAllChecks = () => {
    data.list('checks', (err1, checks) => {
        if (!err1 && checks && checks.length > 0) {
            checks.forEach((checkId) => {
                data.read('checks', checkId, (err2, checkData) => {
                    if (!err2 && checkData) {
                        worker.validateCheckData(parseJson(checkData));
                    } else {
                        console.log('Error reading one of the check data!');
                    }
                });
            });
        } else {
            console.log('Error could not find any checks to process!');
        }
    });
};

worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 8000);
};

worker.init = () => {
    worker.gatherAllChecks();

    worker.loop();
};

module.exports = worker;
