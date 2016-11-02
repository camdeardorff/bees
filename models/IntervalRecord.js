/**
 * Created by Cam on 10/9/16.
 */


//import necessary dependancies
var db = require('../database/database');
var queries = require('../database/queries.json').IntervalRecord;
var Interval = require('./Interval');
// var Moment = require('moment');
var SoundRecord = require('./SoundRecord');
var async = require('async');


var IntervalRecord = function(interval, decibels) {
	this.interval = interval;
	this.decibels = decibels;
};

IntervalRecord.createAtInterval = function (interval, callback) {
	var dates = interval.getDates();
	//grab each record in this frame
	SoundRecord.averageDecibelsBetweenDates(dates.from, dates.to, function (err, average) {
		if (err) {
			callback(err);
		} else {
			var intervalRecord = new IntervalRecord(interval, average);
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
				//don't save
				// the record is already in the database. dont save and dont send back an error\
				callback(null, oldRecord);
			} else {
				// save it
				db.getConnection().query(queries.insert, [intervalRange.from, intervalRange.to, record.decibels], function (err, result) {
					if (err) {
						//TODO: find out the error and send back a good one
						callback(err);
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
							//
						});
					}
				})
			}
		}
	});
};


IntervalRecord.atInterval = function (intervalRange, callback) {
	var dates = intervalRange.getDates();
	db.getConnection().query(queries.at, [dates.from, dates.to], function (err, rows) {
		if (err) {
			callback(err);
		} else {
			if (rows.length > 0) {
				var ir = new IntervalRecord(new Interval.atDate(new Date(rows[0]["from_time"])), rows[0]["decibels"]);
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
	console.log("start");
	var expectedRecords = IntervalRecord.expectedRecordsBetweenDates(start, end);

	console.log("expecting " + expectedRecords + " recods");
	db.getConnection().query(queries.inRange, [start, end], function (err, rows) {
		if (err) {
			callback(err);
		} else {
			console.log("found " + rows.length + " records");
			if (rows.length < expectedRecords) {
				console.log("not all of them are here");
				// not all of the Intervals have been created and then stored
				// get range record at the start
				// get next (store if necessary) until next is not in the range (or if it is in the future)
				var records = [];
				var current = null;
				var now = new Date();

				/*
					ALTERNATE APPROACH
					- receive the rows sorted by date
					- form into an interval and sequentially check if the next interval is the next row provided..
						- if not create it and go again
				 */

				var getFirst = function (finished) {
					console.log("get first");
					IntervalRecord.containingDate(start, function (err, record) {
						if (record) {
							console.log("there was a first record");
							current = record;
							records.push(record);
							finished(err);
						} else {
							console.log("no first record");
							var interval = new Interval.atDate(start);
							IntervalRecord.createAtInterval(interval, function (err, newRecord) {
								if (err) {
									console.log(err);
								}
								console.log("created a new first record");
								current = newRecord;
								records.push(current);
								finished(err);
							});
						}
					});
				};

				// function to fill in the rest of the list
				var fillList = function (finished) {

					//TODO: check if current interval record is null

					console.log("fill list");

					var getNext = function (gotNext) {
						console.log("get next");
						//TODO: what if current is null?
						current.next(function (err, record) {
							if (!err) {
								current = record;
								records.push(record);
							}
							gotNext(err);
						});
					};

					var isInTimeFrame = function () {
						return current.interval.next().getDates().to < end
							&& current.interval.next().getDates().to < now;
					};

					async.doWhilst(getNext, isInTimeFrame,
						function (err) {
						//TODO: err here

							console.log("doen getting next");
							//finish and send the err. if there was an error then it will be handled higher up. otherwise
							// it will be null and we dont care
							finished(err);
						}
					);
				};

				async.series([getFirst, fillList], function (err) {
					console.log("done with everything");
					callback(err, records);
				});

			} else {
				console.log("all of the records were here");
				// all of the records were in the database, send them all back
				var savedRecords = [];
				for (var i=0; i<rows.length; i++) {
					var row = rows[i];
					var record = new IntervalRecord(
						new Interval.atDate(new Date(row["from_time"])),
						row["decibels"]
					);
					savedRecords.push(record);
				}
				callback(null, savedRecords);
			}
		}
	});
};

IntervalRecord.expectedRecordsBetweenDates = function (start, end) {
	/*
	it is easy to get the expected number of records between dates because it should be the number of
	total minutes divided by the range time. But what if there is residue? The residue is still in the
	range so we should return every single record that has a peice of that range.

	If the start is in the middle of an interval then we will give them the full interval they began in.
	If the end is in the middle of an interval then we will give them the full interval they began in UNLESS the
		end date is in the future.

	Fixed bug!
	There is an edge case where the expected records is one more than it should be. If the interval has not yet been
	fully completed - still in progress - then don't include that one.
	 */

	var now = new Date();
	if (end > now) {
		end = now;
	}

	var currentInterval = Interval.atDate(start);
	var endInterval = Interval.atDate(end);

	if (Interval.atDate(now).isEqualToInterval(endInterval)) {
		// the interval is still in progress. don't use this one... get the previous
		endInterval = endInterval.previous();
	}

	// one because start is an interval and consider that start and end are in the same interval.
	var count = 1;
	while (!currentInterval.isEqualToInterval(endInterval)) {
		count += 1;
		currentInterval = currentInterval.next();
	}

	return count;
};


module.exports = IntervalRecord;