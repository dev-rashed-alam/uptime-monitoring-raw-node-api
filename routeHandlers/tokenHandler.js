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

handler._token.get = (requestProperties, callback) => {};

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
                    const expires = Date.now() * 60 * 60 * 1000;
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
            error: 'field missing',
        });
    }
};

handler._token.put = (requestProperties, callback) => {};

handler._token.delete = (requestProperties, callback) => {};

module.exports = handler;
