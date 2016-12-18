/**
 * Created by Cam on 9/28/16.
 */

var express = require('express'),
	SoundRecord = require('../models/SoundRecord'),
	IntervalRecord = require('../models/IntervalRecord');
var errorCodes = require('../errorCodes.json');
var moment = require('moment-timezone');



exports.today = function (req, res, next) {
	var message = {};

	var timeZone = req.params["timeZone"];
	timeZone = timeZone.replace("*=SLASH=*", "/");

	console.log("received request for today");
	console.log("timezone: ", timeZone);

	var start = moment.tz(timeZone)
		.hours(6)
		.minutes(0)
		.seconds(0);

	var end = moment.tz(timeZone)
		.hours(21)
		.minutes(59)
		.seconds(59);

	IntervalRecord.betweenDates(start.toDate(), end.toDate(), function (err, records) {
		if (err) {
			message.success = false;
			message.error = err;
		} else {
			message.success = true;
			message.records = [];
			for (var i = 0; i < records.length; i++) {
				var record = records[i];

				// simplify everything for the client
				var bounds = record.interval.boundsValue();
				delete record.interval;
				record.range = {
					from: moment.utc(bounds.from).tz("America/New_York").format("h:mm"),
					to: moment.utc(bounds.to).tz("America/New_York").format("h:mm")
				};

				message.records.push(record);
			}
		}
		res.json(message);
		next();
	});
};


/*
 router.get('/from/:fromDate/to/:toDate', function (req, res) {
 // 	var message = {};	var MS_PER_MINUTE = 60000;


 var fromDate =
 var offsetString = req.params["utcMinutesOffset"];
 var utcOffset = parseInt(offsetString);
 console.log(utcOffset);

 var message = {};

 var today = new Date();
 today.setHours(0, 0, 0, 0);
 console.log("today : ", today);
 var start = new Date(today.valueOf() + utcOffset * MS_PER_MINUTE);
 console.log("start     : ", start);
 var end = new Date(start.valueOf() + 1440 * MS_PER_MINUTE)
 console.log("end   : ", end);


 IntervalRecord.betweenDates(start, end, function (err, records) {
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

 */
