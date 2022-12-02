const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
    callback(404, {
        message: 'Requested url is not found!',
    });
};

module.exports = handler;
