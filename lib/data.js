const fs = require('fs');
const path = require('path');

const lib = {};

lib.basedir = path.join(__dirname, '/../.data/');

lib.create = (dir, fileName, data, callback) => {
    fs.open(`${lib.basedir + dir}/${fileName}.json`, 'wx', (err1, fileDescriptior) => {
        if (!err1 && fileDescriptior) {
            const stringData = JSON.stringify(data);
            fs.writeFile(fileDescriptior, stringData, (err2) => {
                if (!err2) {
                    fs.close(fileDescriptior, (err3) => {
                        if (!err3) {
                            callback(false);
                        } else {
                            callback('Error closing the new file!');
                        }
                    });
                } else {
                    callback('Error writing to new file!');
                }
            });
        } else {
            callback(err1, 'Unable to create new file. It maybe exist!');
        }
    });
};

lib.read = (dir, fileName, callback) => {
    fs.readFile(`${lib.basedir + dir}/${fileName}.json`, 'utf8', (err, data) => {
        callback(err, data);
    });
};

lib.update = (dir, fileName, data, callback) => {
    fs.open(`${lib.basedir + dir}/${fileName}.json`, 'r+', (err1, fileDescriptior) => {
        const stringData = JSON.stringify(data);
        if (!err1 && fileDescriptior) {
            fs.ftruncate(fileDescriptior, (err2) => {
                if (!err2) {
                    fs.writeFile(fileDescriptior, stringData, (err3) => {
                        if (!err3) {
                            fs.close(fileDescriptior, (err4) => {
                                if (!err4) {
                                    callback(false);
                                } else {
                                    callback('Unable to close file!');
                                }
                            });
                        } else {
                            callback('Unable to write file!');
                        }
                    });
                } else {
                    callback('Unable to trancate file!');
                }
            });
        } else {
            callback('Unable to open file!');
        }
    });
};

lib.delete = (dir, fileName, callback) => {
    fs.unlink(`${lib.basedir + dir}/${fileName}.json`, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback('Unable to delete file!');
        }
    });
};

lib.list = (dir, callback) => {
    fs.readdir(`${lib.basedir + dir}/`, (err, fileNames) => {
        if (!err && fileNames && fileNames.length > 0) {
            const trimmedFileNames = [];
            fileNames.forEach((fileName) => trimmedFileNames.push(fileName.replace('.json', '')));
            callback(false, trimmedFileNames);
        } else {
            callback('Error reading directory!');
        }
    });
};

module.exports = lib;
