'use strict';

const DB = require('./db');
const express = require('express');
const http = require('http');
const io = require('socket.io');
const Message = require('./message');
const config = require('./config');

class App {

    constructor() {
        this.app = express();
        this.db = new DB();
        this.server = http.createServer(this.app);
        this.io = io(this.server);
    }

    registerListeners() {
        const defaultChatRoom = 'default';

        this.io.on('connect', (socket) => {
            socket.emit('welcome', {msg: 'Welcome!'});
            socket.join(defaultChatRoom);

            socket.on('join', (data) => {
                data.chatRoom = data.chatRoom || defaultChatRoom;
                socket.join(data.chatRoom);
                this.io.in(data.chatRoom).emit('joined', {msg: `${data.user} joined!`});
            });

            socket.on('msg', (data) => {
                data.chatRoom = data.chatRoom || defaultChatRoom;
                let message = new this.MessageModel(data);

                message.save()
                    .then(res => this.io.in(data.chatRoom).emit('chatMsg', data));
            });

            socket.on('leave', (data) => {
                data.chatRoom = data.chatRoom || defaultChatRoom;
                socket.leave(data.chatRoom);
                this.io.in(data.chatRoom).emit('left', {msg: `${data.user} left!`});
            });

            socket.on('error', (err) => console.log('Socket Error!', err));
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

    registerModels() {
        this.MessageModel = new Message(this.app).getModel()
    }

    start() {
        return this.db.connect()
            .then(dbConn => {
                this.app.db = dbConn;
                this.registerModels();
                this.registerListeners();
                return this.serverListen();
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.io.close(err => {
                if (err) {
                    console.log(err);
                }
                this.server.close(() => resolve(null));
            });
        });
    }
}

module.exports = App;
