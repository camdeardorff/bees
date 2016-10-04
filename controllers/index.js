/**
 * Created by Cam on 9/28/16.
 */

var express = require('express'),
	router = express.Router();

router.use('/soundReport', require('./soundReport'));

router.get('/', function (req, res) {
	console.log("Got at /");

	res.json("hello");
});

module.exports = router;