const { sampleHandler } = require('./routeHandlers/sampleHandler');
const { tokenHanlder } = require('./routeHandlers/tokenHandler');
const { userHandler } = require('./routeHandlers/userHandler');

const routes = {
    sample: sampleHandler,
    user: userHandler,
    token: tokenHanlder,
};

module.exports = routes;
