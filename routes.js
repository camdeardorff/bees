exports.setRequestUrl = function(app) {
	var index = require('./controllers/index'),
		report = require('./controllers/report'),
		sample = require('./controllers/sample');

	// front page
	app.get('/', index.index);

	// new samples
	app.post('/samples/new', sample.new);
	app.post('/samples/new/bulk', sample.bulk);
	// get report
	app.get('/report/today/:timeZone', report.today);
	app.get('/report/range/from/:fromTime/to/:toTime/inZone/:timeZone', report.range);

	// soon to be deprecated
	// new samples
	app.post('/soundReport/new', sample.new);
	// get samples
	app.get('/soundReport/today/:timeZone', report.today);

};



