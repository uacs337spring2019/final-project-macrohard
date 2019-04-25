var db = require("../db");

var messageSchema = new db.Schema({
	username: { type: String, required: true },
	message: { type: String, required: true },
	timestamp: { type: Date, default: Date.now }
});

var MessageEntry = db.model("MessageEntry", messageSchema);

module.exports = MessageEntry;
