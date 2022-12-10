const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');
const data = require('./lib/data');

const app = {};

// data.create('test', 'testFile', { name: 'Rashed Alam', age: 23 }, (err) => {
//     console.log(err);
// });

// data.read('test', 'testFile', (err, result) => {
//     console.log(err, result);
// });

// data.update('test', 'testFile', { name: 'Rashed', age: 24 }, (err) => {
//     console.log(err);
// });

// data.delete('test', 'testFile', (err) => {
//     console.log(err);
// });

app.createServer = () => {
    const server = http.createServer(app.handleRequest);
    server.listen(environment.port, () => {
        console.log(
            `listinging to port ${environment.port} and env name is ${environment.envName}`
        );
    });
};

app.handleRequest = handleReqRes;

app.createServer();
