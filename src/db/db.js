'use strict';

const mongoose = require('mongoose'),
  Message = require('../models/message');

class DataBase {
  constructor(host) {
    this.host = host;
    this.connection = mongoose.connection;
  }

  connect() {
    return new Promise((resolve, reject) => {
      mongoose.connect(this.host);

      this.connection.on('error', (err) => {
        reject(err);
        return;
      });

      this.connection.once('open', () => {
          return resolve(this.db);
      });
    });
  }

  dropDataBase() {
    return new Promise((resolve, reject) => {
      this.connection.db.dropDatabase((err, result) => {
        if(err) {
          reject(err);
          return
        }
        resolve(result);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
        this.connection.close(() => resolve(null));
    });
  }
}

module.exports = DataBase;
