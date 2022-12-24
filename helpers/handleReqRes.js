const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const { notFoundHandler } = require('../routeHandlers/notFoundHandler');
const { parseJson } = require('./utils');

const handler = {};

handler.handleReqRes = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathName = parsedUrl.pathname.replace(/^\/|\/$/g, '');
    const queryString = parsedUrl.query;
    const { headers, method } = req;
    const methodName = method.toLowerCase();

    const requestProperties = {
        parsedUrl,
        pathName,
        queryString,
        headers,
        methodName,
    };

    const chosenHandler = routes[pathName] ? routes[pathName] : notFoundHandler;

    let realData = '';

    const decoder = new StringDecoder('utf-8');

    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });

    req.on('end', () => {
        realData += decoder.end();
        requestProperties.body = parseJson(realData);
        chosenHandler(requestProperties, (statusCode, payload) => {
            const responseCode = typeof statusCode === 'number' ? statusCode : 500;
            const data = typeof payload === 'object' ? payload : {};

            const payloadString = JSON.stringify(data);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(responseCode);
            res.end(payloadString);
        });
    });
};

module.exports = handler;
