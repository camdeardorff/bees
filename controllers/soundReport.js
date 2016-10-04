/**
 * Created by Cam on 9/28/16.
 */

var express = require('express'),
	router = express.Router(),
	db = require('../database/database');



router.post('/new', function (req, res) {

	var data = req.body;
	var message = {};
	if (data) {
		var sound = data.decibels;
		var time = data.atTime;

		if (sound && time) {
			time = new Date(time);
			var selectString = "INSERT INTO `sound_records` (`id`, `sample_time`, `record_time`, `decibels`) VALUES (NULL, ?, CURRENT_TIMESTAMP, ?);";
			db.getConnection().query(selectString, [time, sound], function (err) {
				if (err) {
					console.log(err);
					message.success = false;
					message.error = "There was a problem inserting that into the database";
				} else {
					message.success = true;
				}
				res.json(message);
			});
		} else {
			message.success = false;
			message.error = "Bad Parameters! This api expects 'decibels' : number, and 'atTime' : Date";
			res.json(message);
		}
	}
});


router.get('/today', function (req, res) {

	var message = {};
	var today = new Date();
	today.setHours(0,0,0,0);

	console.log("today: ", today);

	var selectString = "SELECT `sound_records`.`sample_time`, `sound_records`.`decibels`  FROM `sound_records` WHERE `sample_time` > ?";
	db.getConnection().query(selectString, [today], function (err, rows) {
		if (err) {
			console.log("error: ", err);
			message.success = false;
			message.error = err;
		} else {
			message.success = true;
			message.data = rows;
		}
		res.json(message);
	});
});



router.get('/from/:fromDate/to/:toDate', function (req, res) {
	var message = {};
	var data = req.params;

	if (data) {
		var from = data.fromDate;
		var to = data.toDate;

		if (from && to) {
			var fromDate = new Date(from);
			var toDate = new Date(to);

			var selectString = "SELECT `sound_records`.`sample_time`, `sound_records`.`decibels`  FROM `sound_records` WHERE `sample_time` > ? AND `sample_time < ?";
			db.getConnection().query(selectString, [fromDate, toDate], function (err, rows) {
				if (err) {
					console.log("error: ", err);
					message.success = false;
					message.error = err;
				} else {
					message.success = true;
					message.data = rows;
				}
				res.json(message);
			});
		} else {
			message.success = false;
			message.error = "Bad Parameters";
			res.json(message);
		}
	} else {
		message.success = false;
		message.error = "Bad Parameters";
		res.json(message);
	}
});



module.exports = router;