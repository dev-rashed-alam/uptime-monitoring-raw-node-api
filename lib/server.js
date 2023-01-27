const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
const environment = require('../helpers/environments');

const server = {};

server.createServer = () => {
    const createServer = http.createServer(server.handleRequest);
    createServer.listen(environment.port, () => {
        console.log(
            `listinging to port ${environment.port} and running in ${environment.envName} environment.`
        );
    });
};

server.handleRequest = handleReqRes;

server.init = () => {
    server.createServer();
};

module.exports = server;
