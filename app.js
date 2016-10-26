
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var logger = require('morgan');

app.use("/public", express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(logger('combined'));
app.use(require('./controllers'));
app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', function (req, res) {
	res.render('index');
});


var server = app.listen(process.env.PORT || 3000, function () {
	var host = 'localhost';
	var port = server.address().port;
	console.log('App listening at http://%s:%s', host, port);


});

//
// setTimeout(function () {
//
// 	var Interval = require('./models/Interval');
// 	var SoundRecord = require('./models/SoundRecord');
// 	var IntervalRecord = require('./models/IntervalRecord');
// 	var Moment = require('moment');
//
// 	var moment1 = new Date(Moment().add(-240, "minutes").format("YYYY-MM-DD HH:mm:ss"));
// 	var moment2 = new Date(Moment().add(-120, "minutes").format("YYYY-MM-DD HH:mm:ss"));
//
// 	console.log(moment1.toDateString());
//
// 	var inter = new Interval.atDate(new Date(moment1));
//
// 	IntervalRecord.betweenDates(moment1, moment2, function (err, records) {
// 		console.log(err);
// 		console.log(records);
//
// 		for (var i=0; i<records.length; i++) {
// 			console.log(records[i].interval.getDates().from);
// 		}
// 	});
//
//
//
// }, 1000);


module.exports = app;