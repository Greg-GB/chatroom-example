'use strict';

const Message = require('./models/message'),
    DB = require('./db/db'),
    express = require('express'),
    server = require('http'),
    io = require('socket.io'),
    mongoose = require('mongoose');

class App {
	constructor(config) {
        this.config = config || {};
        this.config.host = this.config.host || 'mongodb://localhost:27017/wsChatExample';
        this.db = new DB(this.config.host);
        this.app = express();
        this.server = server.createServer(this.app);
        this.io = io(this.server);
        // Load socket.io listeners
        require('./controllers/socketListeners')(this.io);
        // Load message routes
        require('./controllers/message')(this.app);
	}

	serverListen() {
		return new Promise((resolve, reject) => {
			this.server.listen(3000, (err) => {
				if (err) {
					reject(err);
					return;
				}
				console.log('Server listening on port 3000');
				return resolve(null);
			});
		});
	}

	start() {
		return this.db.connect()
			.then(this.serverListen())
			.catch((err) => {
				console.log(err);
				throw err;
			});
	}

	close() {
		return new Promise((resolve,reject) => {
			this.server.close(() => resolve(null));
		});
	}
}

module.exports = App;
