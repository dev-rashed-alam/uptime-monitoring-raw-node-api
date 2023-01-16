const { sampleHandler } = require('./routeHandlers/sampleHandler');
const { tokenHanlder } = require('./routeHandlers/tokenHandler');
const { userHandler } = require('./routeHandlers/userHandler');
const { checkHandler } = require('./routeHandlers/checkHandler');

const routes = {
    sample: sampleHandler,
    user: userHandler,
    token: tokenHanlder,
    check: checkHandler,
};

module.exports = routes;
