const environments = {};

environments.stagging = {
    port: 300,
    envName: 'stagging',
    secretKey: 'node-js-stagging',
    maxChecks: 5,
    twilio: {
        fromPhone: '+13149484947',
        authToken: '2635746fd5f36e8ae85aeb7c859f8be1',
        accountSID: 'AC8d9546aa19f6b9fc703aad2a6fa53f03',
    },
};

environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'node-js-production',
    maxChecks: 5,
    twilio: {
        fromPhone: '+13149484947',
        authToken: '2635746fd5f36e8ae85aeb7c859f8be1',
        accountSID: 'AC8d9546aa19f6b9fc703aad2a6fa53f03',
    },
};

const currentEnvironment =
    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'stagging';

const environmentToExport =
    typeof environments[currentEnvironment] === 'object'
        ? environments[currentEnvironment]
        : environments.stagging;

module.exports = environmentToExport;
