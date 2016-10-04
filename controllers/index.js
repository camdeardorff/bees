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
	res.json("hello");
});

module.exports = router;