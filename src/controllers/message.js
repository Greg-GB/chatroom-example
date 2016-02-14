const Message = require('../models/message');

module.exports = (app) => {
    app.get('/msgs', (req, res) => {
        return new Promise((resolve, reject) => {
            Message.find({chatRoom: req.query.chatRoom || 'default'}, (err, docs) => {
                if (err) {
                    reject(err);
                    return;
                }
                return resolve(docs);
            });
        })
        .then((docs) => res.send(docs));
    });
};
