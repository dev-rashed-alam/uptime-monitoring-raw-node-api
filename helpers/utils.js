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

utils.createRandomString = (strLength) => {
    const length = typeof strLength === 'number' && strLength > 0 ? strLength : false;
    if (length) {
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let output = '';

        for (let i = 1; i <= length; i += 1) {
            const randomCharacter = possibleCharacters.charAt(
                Math.floor(Math.random() * possibleCharacters.length)
            );
            output += randomCharacter;
        }

        return output;
    }
    return false;
};

module.exports = utils;
