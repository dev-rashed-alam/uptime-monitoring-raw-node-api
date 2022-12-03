const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const { notFoundHandler } = require('../routeHandlers/notFoundHandler');

const handler = {};

handler.handleReqRes = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathName = parsedUrl.pathname.replace(/^\/|\/$/g, '');
    const quertString = parsedUrl.query;
    const { headers, method } = req;
    const methodNmae = method.toLowerCase();

    const requestProperties = {
        parsedUrl,
        pathName,
        quertString,
        headers,
        methodNmae,
    };

    const chosenHandler = routes[pathName] ? routes[pathName] : notFoundHandler;

    let realData = '';

    const decoder = new StringDecoder('utf-8');

    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });

    req.on('end', () => {
        realData += decoder.end();
        chosenHandler(requestProperties, (statusCode, payload) => {
            const responseCode = typeof statusCode === 'number' ? statusCode : 500;
            const data = typeof payload === 'object' ? payload : {};

            res.writeHead(responseCode);
            res.end(JSON.stringify(data));
        });

        res.end(realData);
    });
};

module.exports = handler;
