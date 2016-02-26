'use strict';

const DB = require('./db/db'),
    express = require('express'),
    server = require('http'),
    io = require('socket.io'),
	Message = require('./message');

class App {
	constructor(config) {
        this.config = config || {};
        this.config.host = this.config.host || 'mongodb://localhost:27017/wsChatExample';
        this.db = new DB(this.config.host);
        this.app = express();
        this.server = server.createServer(this.app);
        this.io = io(this.server);
		this.message = new Message(this.app);
	}

	registerListeners() {
		const defaultChatRoom = 'default',
			Message = this.message.getModel();

		this.io.on('connect', (socket) => {
			socket.emit('welcome', {msg: 'Welcome!'});
			socket.join(defaultChatRoom);

			socket.on('join', (data) => {
				data.chatRoom = data.chatRoom || defaultChatRoom;
				socket.join(data.chatRoom);
				this.io.in(data.chatRoom).emit('joined', {msg: data.user + ' joined!'});
			});

			socket.on('msg', (data) => {
				data.chatRoom = data.chatRoom || defaultChatRoom;
				let message = new Message(data);
				message.save()
					.then(this.io.in(data.chatRoom).emit('chatMsg', data));
			});

			socket.on('leave', (data) => {
				data.chatRoom = data.chatRoom || defaultChatRoom;
				socket.leave(data.chatRoom);
				this.io.in(data.chatRoom).emit('left', {msg: data.user + ' left!'});
			});
		});
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
		this.registerListeners();
		return this.db.connect()
			.then(this.serverListen())
			.catch((err) => {
				console.log(err);
				throw err;
			});
	}

	close() {
		return new Promise((resolve, reject) => {
			this.io.close();
			this.server.close(() => resolve(null));
		});
	}
}

module.exports = App;
