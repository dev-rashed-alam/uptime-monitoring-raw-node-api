const { hash } = require('../helpers/utils');
const data = require('../lib/data');
const { parseJson } = require('../helpers/utils');
const { _token } = require('./tokenHandler');

const handler = {};

handler.userHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.includes(requestProperties.methodName)) {
        handler._users[requestProperties.methodName](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._users = {};

handler._users.get = (requestProperties, callback) => {
    const { queryString } = requestProperties;

    const phoneNumber =
        typeof queryString.phone === 'string' && queryString.phone.length === 11
            ? queryString.phone
            : false;
    if (phoneNumber) {
        const { headers } = requestProperties;
        const tokenId =
            typeof headers.token === 'string' && headers.token.length === 20
                ? headers.token
                : false;
        _token.verify(tokenId, phoneNumber, (isTokenValid) => {
            if (isTokenValid) {
                data.read('users', phoneNumber, (err, user) => {
                    const payload = { ...parseJson(user) };
                    if (!err) {
                        delete payload.password;
                        callback(200, payload);
                    } else {
                        callback(404, {
                            message: 'User not found!',
                        });
                    }
                });
            } else {
                callback(403, {
                    message: 'Authentication failure!',
                });
            }
        });
    } else {
        callback(404, {
            message: 'User not found!',
        });
    }
};

handler._users.post = (requestProperties, callback) => {
    const { body } = requestProperties;
    const firstName =
        typeof body.firstName === 'string' && body.firstName.trim().length > 3
            ? body.firstName
            : false;
    const lastName =
        typeof body.lastName === 'string' && body.lastName.trim().length > 1
            ? body.lastName
            : false;
    const phone =
        typeof body.phone === 'string' && body.phone.trim().length === 11 ? body.phone : false;
    const password =
        typeof body.password === 'string' && body.password.trim().length > 5
            ? body.password
            : false;
    const tosAgreement =
        typeof body.tosAgreement === 'boolean' && body.tosAgreement ? body.tosAgreement : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        data.read('users', phone, (err) => {
            if (err) {
                const userObj = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };

                data.create('users', phone, userObj, (err1) => {
                    if (!err1) {
                        callback(200, {
                            message: 'User Created Successfully!',
                        });
                    } else {
                        callback(500, {
                            error: 'Unable to create user!',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'user already exist',
                });
            }
        });
    } else {
        callback(400, {
            error: 'field missing',
        });
    }
};

handler._users.put = (requestProperties, callback) => {
    const { body } = requestProperties;
    const firstName =
        typeof body.firstName === 'string' && body.firstName.trim().length > 3
            ? body.firstName
            : false;
    const lastName =
        typeof body.lastName === 'string' && body.lastName.trim().length > 1
            ? body.lastName
            : false;
    const phone =
        typeof body.phone === 'string' && body.phone.trim().length === 11 ? body.phone : false;
    const password =
        typeof body.password === 'string' && body.password.trim().length > 5
            ? body.password
            : false;
    if (phone) {
        if (firstName || lastName || password) {
            const { headers } = requestProperties;
            const tokenId =
                typeof headers.token === 'string' && headers.token.length === 20
                    ? headers.token
                    : false;
            _token.verify(tokenId, phone, (isTokenValid) => {
                if (isTokenValid) {
                    data.read('users', phone, (err, user) => {
                        const userData = { ...parseJson(user) };
                        if (!err) {
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (phone) {
                                userData.phone = phone;
                            }

                            data.update('users', phone, userData, (err1) => {
                                if (!err1) {
                                    callback(200, {
                                        message: 'User Updated Successfully!',
                                    });
                                } else {
                                    callback(500, {
                                        error: 'Unable to update user!',
                                    });
                                }
                            });
                        } else {
                            callback(404, {
                                error: 'user not found!',
                            });
                        }
                    });
                } else {
                    callback(403, {
                        message: 'Authentication failure!',
                    });
                }
            });
        } else {
            callback(400, {
                error: 'field missing',
            });
        }
    } else {
        callback(404, {
            message: 'user not found!',
        });
    }
};

handler._users.delete = (requestProperties, callback) => {
    const { queryString } = requestProperties;

    const phoneNumber =
        typeof queryString.phone === 'string' && queryString.phone.length === 11
            ? queryString.phone
            : false;
    if (phoneNumber) {
        const { headers } = requestProperties;
        const tokenId =
            typeof headers.token === 'string' && headers.token.length === 20
                ? headers.token
                : false;
        _token.verify(tokenId, phoneNumber, (isTokenValid) => {
            if (isTokenValid) {
                data.delete('users', phoneNumber, (err) => {
                    if (!err) {
                        callback(200, {
                            message: 'User deleted!',
                        });
                    } else {
                        callback(404, {
                            message: 'Unable to delete user!',
                        });
                    }
                });
            } else {
                callback(403, {
                    message: 'Authentication failure!',
                });
            }
        });
    } else {
        callback(404, {
            message: 'User not found!',
        });
    }
};

module.exports = handler;
