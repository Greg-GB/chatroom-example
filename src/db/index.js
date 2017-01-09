'use strict';

const mongoose = require('mongoose');
const config = require('../config');

mongoose.Promise = global.Promise;

class DataBase {

    constructor() {

    }

    connect() {
        this.connection = mongoose.createConnection(config.host);

        return new Promise((resolve, reject) => {
            this.connection.on('error', (err) => reject(err));
            this.connection.once('open', () => resolve(this.connection));
        });
    }

    dropDataBase() {
        return new Promise((resolve, reject) => {
            this.connection.db.dropDatabase((err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                return resolve(result);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.connection.db.close(err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(null)
            });
        });
    }
}

module.exports = DataBase;
