const express = require('express');
const router = express.Router();
const DBMessages = require("../models/messages");

// Keep track of all typing users
let typingUsers = {};

/* GET all messages, not just recent ones */
router.get('/', function (req, res, next) {
	DBMessages.find({}, function (err, messages) {
		if (err) {
			return res.status(500).json({ success: false, error: err.message });
		}
		else {
			return res.status(200).json({ success: true, messageData: messages });
		}
	});
});

/* GET only recent messages (last 100) */
router.get('/recent/', function (req, res, next) {
	let recentQuery = DBMessages.find({}).sort({ timestamp: -1 }).limit(100);

	recentQuery.exec(function (err, messages) {
		if (err) {
			return res.status(500).json({ success: false, error: err.message });
		}
		else {
			return res.status(200).json({ success: true, messageData: messages });
		}
	});
});

/* GET only recent messages (since lastSeenMsgId) */
router.get('/recent/:lastSeenMsgId', function (req, res, next) {
	// find the timestamp of the specified message
	DBMessages.findOne({ _id: req.params.lastSeenMsgId }, function (err, msg) {
		if (err) {
			return res.status(500).json({ success: false, error: err.message });
		}
		else {
			// get the messsages since that timestamp
			let msgTimestamp = msg.timestamp;
			let recentQuery = DBMessages.find({ timestamp: { $gte: msgTimestamp } }).sort({ timestamp: -1 }).limit(100);

			recentQuery.exec(function (err, messages) {
				if (err) {
					return res.status(500).json({ success: false, error: err.message });
				}
				else {
					return res.status(200).json({ success: true, messageData: messages });
				}
			});
		}
	});
});

/* POST a new message */
router.post('/', function (req, res, next) {
	if (!req.body.message || !req.body.username) {
		return res.status(400).json({ success: false, error: "Please include message and username is POST body." });
	}

	let newMessage = new DBMessages({
		username: req.body.username,
		message: req.body.message
	});

	newMessage.save(function (err, user) {
		if (err) {
			return res.status(400).json({ success: false, error: err.message });
		}
		else {
			return res.status(202).json({ success: true, message: "Message submitted successfully." });
		}
	});
});

/* GET current typing users */
router.get('/typing', function (req, res, next) {
	console.log(typingUsers);
	return res.status(200).json({ typing: typingUsers });
});

/* POST a typing user */
router.post('/typing', function (req, res, next) {
	if (!req.body.username) {
		return res.status(400).json({ success: false, error: "Please include username is POST body." });
	}

	// give the username a timeout of 5s for typing notif
	typingUsers[req.body.username] = 5000;
	console.log(typingUsers);

	return res.status(202).json({ success: true, message: "Typing username submitted successfully." });
});

/* Trim currently typing users every 0.5s */
function trimTypingUsers() {
	for (key in typingUsers) {
		if (typingUsers[key] <= 0) {
			delete typingUsers[key];
		}
	}
}
setInterval(trimTypingUsers, 500);

/* Lower time remaining for typing users every 0.05s */
function lowerTypingTimeForUsers() {
	for (key in typingUsers) {
		typingUsers[key] -= 50;
	}
}
setInterval(lowerTypingTimeForUsers, 50);

module.exports = router;
