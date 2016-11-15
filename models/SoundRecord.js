/**
 * Created by Cam on 10/9/16.
 */


//import necessary dependancies
var db = require('../database/database');
var queries = require('../database/queries.json').SoundRecord;
// var schemas = require("../schemas.js");


function SoundRecord(id, sampleDate, recordDate, decibels) {
	this.id = id;
	this.sampleDate = sampleDate;
	this.recordDate = recordDate || new Date();
	this.decibels = decibels;
}


SoundRecord.prototype.save = function (callback) {
	var record = this;

	db.query(queries.insert, [this.sampleDate, this.decibels], function (err, result) {
		if (err) {
			//TODO: find out the error and send back a good one
			callback(err);
		} else {
			record.id = result.insertId;
			callback(null, record);
		}
	});
};

SoundRecord.samplesBeforeDate = function (date, callback) {

	db.query(queries.beforeDate, [date], function (err, rows) {
		if (err) {
			//TODO: find out the error and send back a good one
			callback(err);
		} else {
			var records = [];

			for (var i = 0; i < rows.length; i++) {
				var row = rows[i];
				records[i] = new SoundRecord(
					row["id"],
					row["sample_time"],
					row["record_time"],
					row["decibels"]
				);
			}

			callback(null, records);
		}
	});
};

SoundRecord.samplesAfterDate = function (date, callback) {
	console.log("getting samples after: ", date);

	db.query(queries.afterDate, [date], function (err, rows) {
		if (err) {
			//TODO: find out the error and send back a good one
			callback(err);
		} else {
			var records = [];
			for (var i = 0; i < rows.length; i++) {
				var row = rows[i];
				console.log("working with row: ", row);
				records[i] = new SoundRecord(
					row["id"],
					row["sample_time"],
					row["record_time"],
					row["decibels"]
				);
			}

			callback(null, records);
		}
	});
};

SoundRecord.samplesBetweenDates = function (start, end, callback) {
	console.log("getting samples between ", start, ", and ", end);
	db.query(queries.betweenDates, [start, end], function (err, rows) {
		if (err) {
			console.log("error: ", err);
			//TODO: find out the error and send back a good one
			callback(err);
		} else {
			var records = [];

			for (var i = 0; i < rows.length; i++) {
				var row = rows[i];
				records[i] = new SoundRecord(
					row["id"],
					row["sample_time"],
					row["record_time"],
					row["decibels"]
				);
			}
			callback(null, records);
		}
	});
};

SoundRecord.averageDecibelsBetweenDates = function (start, end, callback) {
	SoundRecord.samplesBetweenDates(start, end, function (err, records) {
		if (err) {
			callback(err);
		} else {
			if (records.length > 0) {

				// !IMPORTANT! : the query returns the rows in asc order based on decibels...
				// that means we can get the median super easy!

				/*    AVERAGE   */
				// var sum = 0;
				// for (var i = 0; i < records.length; i++) {
				// 	var record = records[i];
				// 	sum += record.decibels;
				// }
				// var average = sum / records.length;

				/*    MEDIAN    */
				var middle = (records.length / 2).toFixed(0);
				var median = records[middle].decibels;

				callback(null, median);
			} else {
				console.log("no records... that's why it is nan");
				// TODO: make a good error code
				callback("There were no records", -1);
			}
		}
	});
};

module.exports = SoundRecord;