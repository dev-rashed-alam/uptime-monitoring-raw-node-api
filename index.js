const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');

const app = {};

app.config = {
    port: 3000,
};

app.createServer = () => {
    const server = http.createServer(app.handleRequest);
    server.listen(app.config.port, () => {
        console.log(`listinging to port ${app.config.port}`);
    });
};

app.handleRequest = handleReqRes;

app.createServer();
