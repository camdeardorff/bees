
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var logger = require('morgan');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(logger('combined'));

app.use(require('./controllers'));

var server = app.listen(process.env.PORT || 3000, function () {
	var host = 'localhost';
	var port = server.address().port;
	console.log('App listening at http://%s:%s', host, port);

	var db = require('/database/database');
	console.log(db());
	console.log(db.getConnection());
});

module.exports = app;