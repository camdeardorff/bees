// https://github.com/wchaowu/nodejs/blob/master/NodeSample/routes.js

exports.setRequestUrl = function(app) {
	var report = require('./controllers/soundReport'),
		index = require('./controllers/index');

	// front page
	app.get('/', index.index);

	// new samples
	app.post('/samples/new', report.new);
	// get samples
	app.get('/samples/today/:timeZone', report.today);

	// soon to be depricated
	// new samples
	app.post('/soundReport/new', report.new);
	// get samples
	app.get('/soundReport/today/:timeZone', report.today);

};



