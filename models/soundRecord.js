/**
 * Created by Cam on 10/9/16.
 */


//import necessary dependancies
var db = require('../database/database');
var queries = require('../database/queries.json').SoundRecord;
var errorCodes = require('../errorCodes.json');


function SoundRecord(id, sampleDate, recordDate, loudness) {
	this.id = id;
	this.sampleDate = sampleDate;
	this.recordDate = recordDate || new Date();
	this.loudness = loudness;
}


SoundRecord.prototype.save = function (callback) {
	var record = this;

	db.query(queries.insert, [this.sampleDate, this.loudness], function (err, result) {
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
					row["loudness"]
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
					row["loudness"]
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
			callback(errorCodes.database_error);
		} else {
			var records = [];
			for (var i = 0; i < rows.length; i++) {
				var row = rows[i];
				console.log(row);
				records[i] = new SoundRecord(
					row["id"],
					row["sample_time"],
					row["record_time"],
					row["loudness"]
				);
			}
			callback(null, records);
		}
	});
};

SoundRecord.medianLoudnessBetweenDates = function (start, end, callback) {
	SoundRecord.samplesBetweenDates(start, end, function (err, records) {
		if (err) {
			callback(err);
		} else {
			if (records.length > 0) {

				// !IMPORTANT! : the query returns the rows in asc order based on loudness...
				// that means we can get the median super easy!


				var middle = (records.length / 2).toFixed(0);
				console.log("!!! records: ", records);
				console.log("middle: ", middle);

				var median = records[middle].loudness;

				callback(null, median);
			} else {
				console.log("no records, cannot find median of empty list.");
				callback(errorCodes.no_records, -1);
			}
		}
	});
};

module.exports = SoundRecord;