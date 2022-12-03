const environments = {};

environments.stagging = {
    port: 300,
    envName: 'stagging',
};

environments.production = {
    port: 5000,
    envName: 'production',
};

const currentEnvironment =
    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'stagging';

const environmentToExport =
    typeof environments[currentEnvironment] === 'object'
        ? environments[currentEnvironment]
        : environments.stagging;

module.exports = environmentToExport;
