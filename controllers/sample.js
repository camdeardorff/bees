/**
 * Created by Cam on 12/17/16.
 */


var express = require('express'),
	SoundRecord = require('../models/soundRecord'),
	errorCodes = require('../errorCodes.json'),
	async = require('async');

exports.new = function (req, res, next) {
	var data = req.body;
	var message = {};
	if (data) {
		var sound = data.loudness;
		var time = new Date(parseInt(data.atTime)) || new Date();

		if (sound != null && time != null) {
			var sr = new SoundRecord(null, time, new Date(), sound);
			sr.save(function (err, savedSoundResult) {
				if (err) {
					console.log("error: ", err);
					message.success = false;
					message.error = err;
				} else {
					// console.log("successfully saved: ", savedSoundResult);
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

exports.bulk = function (req, res, next) {
	var data = req.body;
	var message = {};
	if (data) {
		var samples = data.samples;
		if (samples) {
			async.eachLimit(samples, 5, function (sample, callback) {
				var loudness = sample.loudness;
				var time = new Date(parseInt(sample.atTime));
				if (loudness != null && time != null) {
					var sr = new SoundRecord(null, time, new Date(), loudness);
					sr.save(function (err, savedSoundResult) {
						callback(err);
						console.log("saved");
					});
				} else {
					callback(errorCodes.bad_parameters);
				}
			}, function (err) {
				if (err) {
					message.success = false;
					message.error = err;
				} else {
					message.success = true;
				}
				res.json(message);
				next();
			})
		} else {
			message.success = false;
			message.error = errorCodes.badParameters;
			res.json(message);
			next();
		}
	} else {
		message.success = false;
		message.error = errorCodes.badParameters;
		res.json(message);
		next();
	}
};