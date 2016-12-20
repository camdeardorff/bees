/**
 * Created by Cam on 9/28/16.
 */

var express = require('express'),
	IntervalRecord = require('../models/intervalRecord');
var errorCodes = require('../errorCodes.json');
var moment = require('moment-timezone');



exports.today = function (req, res, next) {
	var message = {};

	var timeZone = req.params["timeZone"].replace("*=SLASH=*", "/");

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


//'/report/range/from/:fromTime/to/:toTime/inZone/:timeZone'

//times will be in a HH:mm format

exports.range = function (req, res, next) {
	var message = {};
	var params = req.params;

	if (params) {
		var from = params["fromTime"];
		var to = params["toTime"];
		var timeZone = params["timeZone"].replace("*=SLASH=*", "/");

		console.log("received request for range");
		console.log("timezone: ", timeZone);
		console.log("from: ", from, ", to: ", to);

		var start = moment.tz(from, "HH:mm", timeZone);
		console.log("start: ", start);
		var end = moment.tz(to, "HH:mm", timeZone);
		console.log("end: ", end);

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



	} else {
		message.success = false;
		message.error = "Bad params";
		res.json(message);
		next();
	}

};
