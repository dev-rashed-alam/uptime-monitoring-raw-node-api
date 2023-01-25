const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');
const { sendTwilioSms } = require('./helpers/notification');

sendTwilioSms('01852346841', 'Test Messaage', (err) => {
    console.log('SMS error', err);
});

const app = {};

app.createServer = () => {
    const server = http.createServer(app.handleRequest);
    server.listen(environment.port, () => {
        console.log(
            `listinging to port ${environment.port} and env name is ${environment.envName}`
        );
    });
};

app.handleRequest = handleReqRes;

app.createServer();
