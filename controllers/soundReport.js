/**
 * Created by Cam on 9/28/16.
 */

var express = require('express'),
	router = express.Router(),
	SoundRecord = require('../models/SoundRecord'),
	IntervalRecord = require('../models/IntervalRecord');
	errorCodes = require('../errorCodes.json');



router.post('/new', function (req, res) {

	var data = req.body;
	var message = {};
	if (data) {
		var sound = data.decibels;
		var time = data.atTime;

		if (sound && time) {

			console.log("Attempt new sound record");
			var sr = new SoundRecord(null, time, null, sound);
			sr.save(function (err, savedSoundResult) {
				if (err) {
					console.log("error: ", err);
					message.success = false;
					message.error = err;
				} else {
					console.log("successfully saved: ", savedSoundResult);
					message.success = true;

				}
				res.json(message);
			});
		} else {
			message.success = false;
			message.error = errorCodes.badParameters;
			res.json(message);
		}
	} else {
		message.success = false;
		res.json(message);
	}
});


router.get('/today', function (req, res) {

	var message = {};
	var today = new Date();
	today.setHours(0,0,0,0);

	var tomorrow = new Date();
	tomorrow.setDate(today.getDate() + 1);
	tomorrow.setHours(0,0,0,0);

	console.log("today: ", today);
	console.log("tomorrow: ", tomorrow);

	IntervalRecord.betweenDates(today, tomorrow, function (err, records) {
		if (err) {
			message.success = false;
			message.error = err;
		} else {
			message.success = true;
			message.records = [];
			for (var i = 0; i < records.length; i++) {
				message.records.push(records[i]);
			}
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

			var selectString = "SELECT `sound_records`.`sample_time`, `sound_records`.`decibels` " +
				"FROM `sound_records` WHERE `sample_time` > ? AND `sample_time < ?";
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