const mongoose = require('mongoose');

const Message = new mongoose.Schema({
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: String,
		required: true,
		trim: true
	},
	chatRoom: {
		type: String,
		required: true,
		trim: true
	},
	msg: {
		type: String,
		required: true,
		trim: true
	}
});

module.exports = mongoose.model('Message', Message);
