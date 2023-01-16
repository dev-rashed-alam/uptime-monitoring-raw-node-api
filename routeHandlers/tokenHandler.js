const { hash, createRandomString } = require('../helpers/utils');
const data = require('../lib/data');
const { parseJson } = require('../helpers/utils');

const handler = {};

handler.tokenHanlder = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.includes(requestProperties.methodName)) {
        handler._token[requestProperties.methodName](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._token = {};

handler._token.get = (requestProperties, callback) => {
    const { queryString } = requestProperties;

    const tokenId =
        typeof queryString.id === 'string' && queryString.id.length === 20 ? queryString.id : false;
    if (tokenId) {
        data.read('tokens', tokenId, (err, tokenData) => {
            const payload = { ...parseJson(tokenData) };
            if (!err) {
                callback(200, payload);
            } else {
                callback(404, {
                    message: 'Token not found!',
                });
            }
        });
    } else {
        callback(404, {
            message: 'Token not found!',
        });
    }
};

handler._token.post = (requestProperties, callback) => {
    const { body } = requestProperties;
    const phone =
        typeof body.phone === 'string' && body.phone.trim().length === 11 ? body.phone : false;
    const password =
        typeof body.password === 'string' && body.password.trim().length > 5
            ? body.password
            : false;
    if (phone && password) {
        data.read('users', phone, (err1, userData) => {
            if (!err1) {
                const hashedPassword = hash(password);
                const user = { ...parseJson(userData) };
                if (hashedPassword === user.password) {
                    const tokenId = createRandomString(20);
                    const expires = Date.now() + 60 * 60 * 1000;
                    const tokenObj = {
                        phone,
                        id: tokenId,
                        expires,
                    };

                    data.create('tokens', tokenId, tokenObj, (err2) => {
                        console.log(err2);
                        if (!err2) {
                            callback(200, tokenObj);
                        } else {
                            callback(500, {
                                message: 'Internal server error!',
                            });
                        }
                    });
                } else {
                    callback(400, {
                        message: 'Password is not valid!',
                    });
                }
            } else {
                callback(404, {
                    message: 'User not found!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'There was a problem in your request',
        });
    }
};

handler._token.put = (requestProperties, callback) => {
    const { body } = requestProperties;
    const tokenId = typeof body.id === 'string' && body.id.trim().length === 20 ? body.id : false;
    const extend = !!(typeof body.extend === 'boolean' && body.extend === true);

    if (tokenId && extend) {
        data.read('tokens', tokenId, (err1, tokenData) => {
            if (!err1) {
                const tokenObject = { ...parseJson(tokenData) };
                tokenObject.expires = Date.now() + 60 * 60 * 1000;
                data.update('tokens', tokenId, tokenObject, (err2) => {
                    if (!err2) {
                        callback(200);
                    } else {
                        callback(400, {
                            error: 'There was a server side error!',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'Token not found!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'There was a problem in your request',
        });
    }
};

handler._token.delete = (requestProperties, callback) => {
    const { queryString } = requestProperties;

    const tokenId =
        typeof queryString.id === 'string' && queryString.id.trim().length === 20
            ? queryString.id
            : false;
    if (tokenId) {
        data.delete('tokens', tokenId, (err) => {
            if (!err) {
                callback(200, {
                    message: 'The token was deleted!',
                });
            } else {
                callback(404, {
                    message: 'Unable to delete token!',
                });
            }
        });
    } else {
        callback(404, {
            message: 'Token not found!',
        });
    }
};

handler._token.verify = (tokenId, phone, callback) => {
    data.read('tokens', tokenId, (err, tokeData) => {
        const tokenObj = { ...parseJson(tokeData) };
        if (!err) {
            if (phone === tokenObj.phone && tokenObj.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

module.exports = handler;
