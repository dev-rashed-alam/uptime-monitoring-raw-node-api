const crypto = require('crypto');
const environment = require('./environments');

const utils = {};

utils.parseJson = (jsonString) => {
    let output;

    try {
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }

    return output;
};

utils.hash = (content) => {
    if (typeof content === 'string' && content.length > 0) {
        const hash = crypto
            .createHmac('sha256', environment.secretKey)
            .update(content)
            .digest('hex');
        return hash;
    }
    return false;
};

module.exports = utils;
