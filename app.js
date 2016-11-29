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
app.set('views', './views');
app.set('view engine', 'pug');

var routes = require('./routes');
routes.setRequestUrl(app);

var server = app.listen(process.env.PORT || 3000, function () {
	var host = 'localhost';
	var port = server.address().port;
	console.log('App listening at http://%s:%s', host, port);
});

module.exports = app;