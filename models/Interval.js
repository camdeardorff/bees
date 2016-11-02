/**
 * Created by Cam on 10/13/16.
 */
var moment = require('moment');

var intervalRanges = [
	{from: {minutes: 0, seconds: 0}, to: {minutes: 14, seconds: 59}},
	{from: {minutes: 15, seconds: 0}, to: {minutes: 29, seconds: 59}},
	{from: {minutes: 30, seconds: 0}, to: {minutes: 44, seconds: 59}},
	{from: {minutes: 45, seconds: 0}, to: {minutes: 59, seconds: 59}}
];

var Interval = function(date, hour, intervalNum) {
	this.date = date;
	this.hour = hour;
	this.intervalIndex = intervalNum;
	if (intervalNum < intervalRanges.length) {
		this.range = intervalRanges[intervalNum];
	} else {
		// TODO: do something with range here
		this.range = intervalRanges[0];
	}
};


Interval.prototype.getDates = function () {

	var start = moment(this.date)
		.hour(this.hour)
		.minutes(this.range.from.minutes)
		.seconds(this.range.from.seconds);

	var end = moment(this.date)
		.hour(this.hour)
		.minutes(this.range.to.minutes)
		.seconds(this.range.to.seconds);

	return {
		from: new Date(start.toString()),
		to: new Date(end.toString())
	}
};

Interval.prototype.next = function () {

	var nextDate = this.date;
	var nextHour = this.hour;
	var nextIntervalNum = this.intervalIndex;


	if (this.intervalIndex + 1 >= intervalRanges.length) {
		// last range in the hour. increment the hour if we are in the same day.
		nextIntervalNum = 0;
		if (nextHour > 23) {
			nextHour = 0;
			// move to tomorrow
			var newMoment = moment(this.date)
				.add(1, 'day')
				.hour(0)
				.minutes(0)
				.seconds(0);
			nextDate = newMoment.format('YYYY-MM-DD');

		} else {
			// we are in the same day
			nextHour += 1;
		}
	} else {
		// same hour, just next range
		nextIntervalNum += 1;
	}
	return new Interval(nextDate, nextHour, nextIntervalNum);
};


Interval.prototype.previous = function () {
	var previousDate = this.date;
	var previousHour = this.hour;
	var previousIntervalNum = this.intervalIndex;

	if (this.intervalIndex - 1 < 0) {
		// this was the first interval. make it the last
		previousIntervalNum = intervalRanges.length -1;
		if (previousHour < 1) {
			previousHour = 23;
			// move to yesterday
			var newMoment = moment(this.date)
				.add(-1, 'day')
				.hour(23)
				.minutes(45)
				.seconds(0);
			previousDate = newMoment.format('YYYY-MM-DD');
		} else {
			previousHour -= 1;
		}
	} else {
		previousIntervalNum -= 1;
	}
	return new Interval(previousDate, previousHour, previousIntervalNum);

};








Interval.prototype.isEqualToInterval = function (otherInterval) {
	return (this.date === otherInterval.date &&
			this.hour === otherInterval.hour &&
			this.intervalIndex === otherInterval.intervalIndex);

};


Interval.atDate = function (dateObj) {
	var newMoment = moment(dateObj);

	var minute = newMoment.minutes();
	var hour = newMoment.hour();
	var date = newMoment.format('YYYY-MM-DD');
	var intervalIndex = 0;

	if (0 <= minute && minute < 15) {
		intervalIndex = 0;
	} else if (15 <= minute && minute < 30) {
		intervalIndex = 1;
	} else if (30 <= minute && minute < 45) {
		intervalIndex = 2;
	} else if (45 <= minute && minute < 60) {
		intervalIndex = 3;
	}

	return new Interval(date, hour, intervalIndex);
};

module.exports = Interval;