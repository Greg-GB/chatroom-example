'use strict';

const MessageService = require('./service'),
    MessageModel = require('./model');

class Message {
    constructor(app) {
        this.app = app;
        this.model = MessageModel;
        this.service = new MessageService(this.model);
        this.registerRoutes();
    }

    registerRoutes() {
        this.app.route('/msgs')
            .get((req, res) => this.service.getMsgs(req, res));
    }

    getModel() {
        return this.model;
    }

    getService() {
        return this.service;
    }
}

module.exports = Message;