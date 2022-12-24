const { sampleHandler } = require('./routeHandlers/sampleHandler');
const { userHandler } = require('./routeHandlers/userHandler');

const routes = {
    sample: sampleHandler,
    user: userHandler,
};

module.exports = routes;
