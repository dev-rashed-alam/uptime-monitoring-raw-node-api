const { createRandomString } = require('../helpers/utils');
const data = require('../lib/data');
const { parseJson } = require('../helpers/utils');
const { _token } = require('./tokenHandler');
const { maxChecks } = require('../helpers/environments');

const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.includes(requestProperties.methodName)) {
        handler._check[requestProperties.methodName](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
    const { body } = requestProperties;

    const protocol =
        typeof body.protocol === 'string' && ['HTTP', 'HTTPS'].includes(body.protocol)
            ? body.protocol
            : false;
    const url = typeof body.url === 'string' && body.url.trim().length > 0 ? body.url : false;
    const method =
        typeof body.method === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].includes(body.method)
            ? body.method
            : false;
    const successCodes =
        typeof body.successCodes === 'object' && body.successCodes instanceof Array
            ? body.successCodes
            : false;

    const timeoutSeconds =
        typeof body.timeoutSeconds === 'number' &&
        body.timeoutSeconds >= 1 &&
        body.timeoutSeconds <= 5
            ? body.timeoutSeconds
            : false;

    const { headers } = requestProperties;
    const tokenId =
        typeof headers.token === 'string' && headers.token.length === 20 ? headers.token : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        data.read('tokens', tokenId, (err1, tokenObj) => {
            if (!err1 && tokenObj) {
                const userPhone = parseJson(tokenObj).phone;

                data.read('users', userPhone, (err2, userData) => {
                    if (!err2 && userData) {
                        const userObj = parseJson(userData);
                        _token.verify(tokenId, userObj.phone, (isTokenValid) => {
                            if (isTokenValid) {
                                const userChecks =
                                    typeof userObj.checks === 'object' &&
                                    userObj.checks instanceof Array
                                        ? userObj.checks
                                        : [];

                                if (userChecks.length < maxChecks) {
                                    const checkId = createRandomString(20);
                                    const checkObj = {
                                        id: checkId,
                                        phone: userObj.phone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    };

                                    data.create('checks', checkId, checkObj, (err3) => {
                                        if (!err3) {
                                            userObj.checks = userChecks;
                                            userObj.checks.push(checkId);

                                            data.update('users', userObj.phone, userObj, (err4) => {
                                                if (!err4) {
                                                    callback(200, userObj);
                                                } else {
                                                    callback(500, {
                                                        error: 'There is a problem in the server side!',
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'There is a problem in the server side!',
                                            });
                                        }
                                    });
                                } else {
                                    callback(403, {
                                        error: 'User has already reached max limits!',
                                    });
                                }
                            } else {
                                callback(403, {
                                    error: 'Authentication problem!',
                                });
                            }
                        });
                    } else {
                        callback(404, {
                            error: 'User not found!',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication problem!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have problem in your request!',
        });
    }
};

handler._check.get = (requestProperties, callback) => {
    const { queryString, headers } = requestProperties;

    const checkId =
        typeof queryString.id === 'string' && queryString.id.length === 20 ? queryString.id : false;
    if (checkId) {
        data.read('checks', checkId, (err1, checkData) => {
            if (!err1 && checkData) {
                const checkObj = parseJson(checkData);
                const tokenId =
                    typeof headers.token === 'string' && headers.token.length === 20
                        ? headers.token
                        : false;
                _token.verify(tokenId, checkObj.phone, (isTokenValid) => {
                    if (isTokenValid) {
                        callback(200, checkObj);
                    } else {
                        callback(403, {
                            error: 'Authentication Invalid!',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'You have a problem in your request!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request!',
        });
    }
};

handler._check.put = (requestProperties, callback) => {
    const { body, headers } = requestProperties;
    const protocol =
        typeof body.protocol === 'string' && ['HTTP', 'HTTPS'].includes(body.protocol)
            ? body.protocol
            : false;
    const checkId = typeof body.id === 'string' && body.id.trim().length === 20 ? body.id : false;
    const url = typeof body.url === 'string' && body.url.trim().length > 0 ? body.url : false;
    const method =
        typeof body.method === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].includes(body.method)
            ? body.method
            : false;
    const successCodes =
        typeof body.successCodes === 'object' && body.successCodes instanceof Array
            ? body.successCodes
            : false;

    const timeoutSeconds =
        typeof body.timeoutSeconds === 'number' &&
        body.timeoutSeconds >= 1 &&
        body.timeoutSeconds <= 5
            ? body.timeoutSeconds
            : false;

    if (checkId) {
        if (url || method || successCodes || timeoutSeconds || protocol) {
            data.read('checks', checkId, (err1, checkData) => {
                if (!err1 && checkData) {
                    const checkObj = parseJson(checkData);
                    const tokenId =
                        typeof headers.token === 'string' && headers.token.length === 20
                            ? headers.token
                            : false;
                    _token.verify(tokenId, checkObj.phone, (isTokenValid) => {
                        if (isTokenValid) {
                            if (protocol) {
                                checkObj.protocol = protocol;
                            }
                            if (method) {
                                checkObj.method = method;
                            }
                            if (successCodes) {
                                checkObj.successCodes = successCodes;
                            }
                            if (timeoutSeconds) {
                                checkObj.timeoutSeconds = timeoutSeconds;
                            }
                            if (url) {
                                checkObj.url = url;
                            }
                            data.update('checks', checkId, checkObj, (err2) => {
                                if (!err2) {
                                    callback(200);
                                } else {
                                    callback(500, {
                                        error: 'There was a server side error!',
                                    });
                                }
                            });
                        } else {
                            callback(403, {
                                error: 'Authentication Invalid!',
                            });
                        }
                    });
                } else {
                    callback(500, {
                        error: 'There was a problem in the server side!',
                    });
                }
            });
        } else {
            callback(400, {
                error: 'You must provide at least one field!',
            });
        }
    } else {
        callback(400, {
            error: 'You have a problem in your request!',
        });
    }
};

handler._check.delete = (requestProperties, callback) => {
    const { queryString, headers } = requestProperties;

    const checkId =
        typeof queryString.id === 'string' && queryString.id.length === 20 ? queryString.id : false;
    if (checkId) {
        data.read('checks', checkId, (err1, checkData) => {
            if (!err1 && checkData) {
                const checkObj = parseJson(checkData);
                const tokenId =
                    typeof headers.token === 'string' && headers.token.length === 20
                        ? headers.token
                        : false;
                _token.verify(tokenId, checkObj.phone, (isTokenValid) => {
                    if (isTokenValid) {
                        data.delete('checks', checkId, (err2) => {
                            if (!err2) {
                                data.read('users', checkObj.phone, (err3, userData) => {
                                    const userObj = parseJson(userData);
                                    if (!err3 && userData) {
                                        const userChecks =
                                            typeof userObj.checks === 'object' &&
                                            userObj.checks instanceof Array
                                                ? userObj.checks
                                                : [];

                                        const checkPositions = userChecks.indexOf(checkId);
                                        if (checkPositions > -1) {
                                            userChecks.splice(checkPositions, 1);

                                            userObj.checks = userChecks;
                                            data.update('users', userObj.phone, userObj, (err4) => {
                                                if (!err4) {
                                                    callback(200);
                                                } else {
                                                    callback(500, {
                                                        error: 'There was a problem in the server side!',
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'Check id is not found in the user!',
                                            });
                                        }
                                    } else {
                                        callback(404, {
                                            error: 'User not found!',
                                        });
                                    }
                                });
                            } else {
                                callback(500, {
                                    error: 'There was a problem in the server side!',
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: 'Authentication Invalid!',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'You have a problem in your request!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request!',
        });
    }
};

module.exports = handler;
