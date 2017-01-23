/**
 * Created by Cam on 10/9/16.
 */


//import necessary dependencies
var db = require('../database/database'),
	queries = require('../database/queries.json').IntervalRecord,
	Interval = require('./interval'),
	moment = require('moment'),
	SoundRecord = require('./soundRecord'),
	async = require('async'),
	errorCodes = require("../errorCodes.json");


var IntervalRecord = function (interval, loudness) {
	this.interval = interval;
	this.loudness = loudness;
};

IntervalRecord.createAtInterval = function (interval, callback) {
	var dates = interval.getDates();
	//grab each record in this frame
	SoundRecord.medianLoudnessBetweenDates(dates.from, dates.to, function (err, median) {
		// handle an error first if it comes up
		if (err && !median) {
			callback(err);
		} else {
			// save a new interval record
			var intervalRecord = new IntervalRecord(interval, median);
			intervalRecord.save(function (err, record) {
				if (err) {
					callback(err);
				} else {
					callback(null, record);
				}
			})
		}
	});
};

/*
 saves unique records only. when saving this function checks if this record is already in the database. if it is then
 it is not saved.
 */
IntervalRecord.prototype.save = function (callback) {
	var record = this;
	var intervalRange = this.interval.getDates();

	IntervalRecord.atInterval(this.interval, function (err, oldRecord) {
		if (err) {
			callback(err);
		} else {
			if (oldRecord) {
				// don't save, send back the old record
				// the record is already in the database. Don't save and don't send back an error.
				callback(null, oldRecord);
			} else {
				// save it
				db.query(queries.insert, [intervalRange.from, intervalRange.to, record.loudness], function (err, result) {
					if (err) {
						callback(errorCodes.save_error);
					} else {
						record.id = result.insertId;
						callback(null, record);
					}
				});
			}
		}
	});
};

IntervalRecord.prototype.next = function (callback) {
	var nextInterval = this.interval.next();
	IntervalRecord.atInterval(nextInterval, function (err, intervalRecord) {
		if (err) {
			callback(err);
		} else {
			if (intervalRecord) {
				callback(null, intervalRecord);
			} else {
				IntervalRecord.createAtInterval(nextInterval, function (err, newRecord) {
					if (err) {
						callback(err);
					} else {
						callback(null, newRecord);

						//save asynchronously?
						newRecord.save(function (err, savedRecord) {
							// if it doesn't go through nothing was lost. We'll get it next time.
						});
					}
				})
			}
		}
	});
};


IntervalRecord.atInterval = function (intervalRange, callback) {
	var dates = intervalRange.getDates();
	db.query(queries.at, [dates.from, dates.to], function (err, rows) {
		if (err) {
			callback(errorCodes.database_error);
		} else {
			if (rows.length > 0) {
				var ir = new IntervalRecord(new Interval.atDate(new Date(rows[0]["from_time"])), rows[0]["loudness"]);
				callback(null, ir);
			} else {
				callback();
			}
		}
	});
};

IntervalRecord.containingDate = function (dateObj, callback) {
	var interval = Interval.atDate(dateObj);

	IntervalRecord.atInterval(interval, function (err, record) {
		if (err) {
			callback(err);
		} else {
			callback(null, record);
		}
	})
};

IntervalRecord.betweenDates = function (start, end, callback) {
	var expectedRecords = IntervalRecord.intervalsOfRecordsBetweenDates(start, end);

	if (expectedRecords.length === 0) {
		callback(errorCodes.future_date);
	} else {
		// console.log("expecting " + expectedRecords + " records");
		db.query(queries.inRange, [start, end], function (err, rows) {
			if (err) {
				// console.log("error getting the interval records in range: ", err);
				callback(err);
			} else {
				if (rows.length >= expectedRecords) {
					// all of the records were in the database, send them all back
					var savedRecords = [];
					for (var i = 0; i < rows.length; i++) {
						var intervalFromRow = new Interval.atDate(new Date(rows[i]["from_time"]));
						var loudnessFromRow = rows[i]["loudness"];
						var dbIntervalRecord = new IntervalRecord(intervalFromRow, loudnessFromRow);
						savedRecords.push(dbIntervalRecord);
					}
					callback(null, savedRecords);
				} else {
					// console.log("not all of them are here");
					// not all of the Intervals have been created and then stored
					// get range record at the start
					// get next (store if necessary) until next is not in the range (or if it is in the future)
					var records = [];

					var storedRecordsStack = [];
					for (var i = 0; i < rows.length; i += 1) {
						var interval = Interval.atDate(new Date(rows[i]["from_time"]));
						var loudness = rows[i]["loudness"];
						var record = new IntervalRecord(interval, loudness);
						storedRecordsStack.push(record);
					}

					var currentInterval = Interval.atDate(start);
					var endInterval = Interval.atDate(end);

					if (currentInterval.isInFuture() || currentInterval.isInProgress()) {
						// we are in trouble!
						callback(errorCodes.future_date);
					}

					// move the endInterval to a safe position
					//TODO: consider getting the interval at the current date and getting the previous
					while (endInterval.isInProgress() || endInterval.isInFuture()) {
						endInterval = endInterval.previous();
					}


					// boolean function, figures out if there are still more intervals to go.
					var intervalsRemain = function () {
						return (!currentInterval.isEqualToInterval(endInterval.next()) && !currentInterval.isInFuture())
					};

					// get the next record from the storedRecordsStack or create a new record from the
					var getNext = function (done) {
						if (storedRecordsStack.length > 0 && storedRecordsStack[0].interval.isEqualToInterval(currentInterval)) {
							// check if the current interval's record is at the top of the stack
							// if it is then add it to the records to send back
							// remove that record from the top of the stack
							records.push(storedRecordsStack.shift());
							// always keep moving forward
							currentInterval = currentInterval.next();
							done();
						} else {
							//create record for this interval
							IntervalRecord.createAtInterval(currentInterval, function (err, newIntervalRecord) {
								if (err) {
									done(err);
								} else {
									records.push(newIntervalRecord);
									// always keep moving forward
									currentInterval = currentInterval.next();
									done();
								}
							});
						}
					};

					// get the next record while there are still intervals to progress through
					async.doWhilst(getNext, intervalsRemain,
						function (err) {
							//finish and send the err. if there was an error then it will be handled higher up.
							callback(err, records);
						}
					);
				}
			}
		});
	}
};

IntervalRecord.intervalsOfRecordsBetweenDates = function (start, end) {
	// console.log("expected Records Between Dates: ", start, " ,", end);

	var intervals = Interval.allBetweenDates(start, end);
	var eligibleIntervals = [];
	for (var i = 0; i < intervals.length; i++) {
		var interval = intervals[i];
		if (!interval.isInFuture() && !interval.isInProgress()) {
			eligibleIntervals.push(interval);
		}
	}

	return eligibleIntervals;
};


module.exports = IntervalRecord;