'use strict';

const io = require('socket.io-client');

class SocketClient {

    constructor(config) {
        this.config = config || {};
        this.socket = io.connect(this.config.url);
    }

    listen(type, cb) {
        this.socket.on(type, cb);
    }

    removeAllListeners() {
        this.socket.removeAllListeners();
    }

    sendMsg(type, data) {
        this.socket.emit(type, data);
    }

    close() {
        return new Promise((resolve, reject) => {
            this.socket.disconnect();
            resolve(null)
        });
    }
}

module.exports = SocketClient;
