'use strict';

const io = require('socket.io-client');

class SocketClient {

    constructor(config) {
        this.config = config || {};
        this.socket = io.connect(this.config.url, {
            forceNew: true,
            query: {user: this.config.user}
        });
    }

    getSocket() {
        return this.socket;
    }

    listen(type, cb) {
        this.socket.on(type, cb);
    }

    removeAllListeners() {
        this.socket.removeAllListeners();
    }

    emit(type, data) {
        this.socket.emit(type, data);
    }

    removeListener(event, listener) {
        this.socket.removeListener(event, listener);
    }

    close() {
        this.socket.disconnect();
    }
}

module.exports = SocketClient;
