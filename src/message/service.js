'use strict';

class MessageService {

    constructor(model) {
        this.model = model;
    }

    getMsgs(req, res) {
        return new Promise((resolve, reject) => {
            this.model.find({chatRoom: req.query.chatRoom}, (err, docs) => {
                if (err) {
                    reject(err);
                    return;
                }
                return resolve(docs);
            });
        })
            .then(docs => res.send(docs));
    }
}

module.exports = MessageService;