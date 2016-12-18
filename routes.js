// https://github.com/wchaowu/nodejs/blob/master/NodeSample/routes.js

exports.setRequestUrl = function(app) {
	var index = require('./controllers/index'),
		report = require('./controllers/report'),
		sample = require('./controllers/sample');

	// front page
	app.get('/', index.index);

	// new samples
	app.post('/sample/new', sample.new);
	// get report
	app.get('/today/:timeZone', report.today);

	// soon to be deprecated
	// new samples
	app.post('/soundReport/new', sample.new);
	// get samples
	app.get('/soundReport/today/:timeZone', report.today);

};



