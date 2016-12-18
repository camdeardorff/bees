/**
 * Created by Cam on 12/17/16.
 */


var express = require('express'),
	SoundRecord = require('../models/soundRecord'),
	IntervalRecord = require('../models/intervalRecord');
var errorCodes = require('../errorCodes.json');

exports.new = function (req, res, next) {
	var data = req.body;
	var message = {};
	if (data) {
		var sound = data.decibels || data.loundness;
		var time = new Date(data.atTime) || new Date();

		if (sound && time) {
			var sr = new SoundRecord(null, time, new Date(), sound);
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
				next();
			});
		} else {
			message.success = false;
			message.error = errorCodes.badParameters;
			res.json(message);
			next();
		}
	} else {
		message.success = false;
		res.json(message);
		next();
	}

};