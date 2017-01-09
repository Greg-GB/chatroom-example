'use strict';

const MessageService = require('./service');
const MessageModel = require('./model');

class Message {

    constructor(app) {
        this.app = app;
    }

    registerRoutes() {
        this.app.route('/msgs')
            .get((req, res) => this.getService().getMsgs(req, res));
    }

    getModel() {
        return this.app.db.model('Messages', MessageModel);
    }

    getService() {
        if (this.service) {
            return this.service;
        }

        return this.service = new MessageService(this.getModel());
    }
}

module.exports = Message;