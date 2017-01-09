'use strict';

const DB = require('./db');
const express = require('express');
const http = require('http');
const io = require('socket.io');
const Message = require('./message');
const config = require('./config');
const eventHandlers = require('./eventHandlers');

class App {

    constructor() {
        this.app = express();
        this.db = new DB();
        this.server = http.createServer(this.app);
        this.io = io(this.server);
        this.message = new Message(this.app);
    }

    registerSocketListeners() {
        this.io.use((socket, next) => {
            // Quick middleware to check if the socket id is part of the room
            if (!socket.checkRoomForId) {
                socket.checkRoomForId = (room, id) => {
                    let foundRoom = this.io.sockets.adapter.rooms[room];
                    return (foundRoom) ? Object.keys(foundRoom.sockets).indexOf(id) > -1 : false;
                }
            }
            next();
        });

        this.io.on('connection', (socket) => {
            socket.authenticated = false;

            socket.use((event, next) => {
                if (!socket.authenticated && event[0] !== 'authenticate') {
                    socket.disconnect({msg: 'Authentication error'});
                    next(new Error('Authentication error'));
                } else {
                    next();
                }
            });

            socket.on('authenticate', eventHandlers.authenticate.bind(this, socket));

            socket.on('join', eventHandlers.join.bind(this, socket));

            socket.on('msg', eventHandlers.message.bind(this, socket));

            socket.on('leave', eventHandlers.leave.bind(this, socket));

            socket.on('error', eventHandlers.error.bind(this, socket));
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
        this.message.getModel();
    }

    registerRoutes() {
        this.message.registerRoutes();
    }

    start() {
        return this.db.connect()
            .then(dbConn => {
                this.app.db = dbConn;
                this.registerModels();
                this.registerRoutes();
                this.registerSocketListeners();
                return this.serverListen();
            })
            .catch(err => {
                console.log(err);
                process.exit(1);
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
