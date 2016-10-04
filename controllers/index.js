/**
 * Created by Cam on 9/28/16.
 */

var express = require('express'),
	router = express.Router();

router.use('/soundReport', require('./soundReport'));


var db = require('../database/database');
console.log(db);
console.log(db.getConnection());

router.get('/', function (req, res) {
	console.log("Got at /");
	//render page to user here


	db.getConnection().query('SELECT *  FROM \"CafRecord\"', [], function (err, results) {
		console.log("part 1");
		if (err) {
			console.log(err);
		}
		if (results) {
			console.log(results);
		}
	});


	db.getConnection().query('SELECT *  FROM "CafRecord"', [], function (err, results) {
		console.log("part 2");
		if (err) {
			console.log(err);
		}
		if (results) {
			console.log(results);
		}
	});

	db.getConnection().query('SELECT *  FROM CafRecord', [], function (err, results) {
		console.log("part 3");
		if (err) {
			console.log(err);
		}
		if (results) {
			console.log(results);
		}
	});




	res.json("hello");
});

module.exports = router;