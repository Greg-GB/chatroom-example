'use strict';

const MessageService = require('./service');
const MessageModel = require('./model');

class Message {

    constructor(app) {
        this.app = app;
        this.model = this.app.db.model('Messages', MessageModel);
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