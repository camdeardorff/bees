
var pg = require('pg');
var config = require('../config/database-config');



var db = function () {
	this.pool = null;
};

db.getConnection = function () {
	if (this.pool) {
		return this.pool;
	} else {
		this.pool = new pg.Pool(config);

		this.pool.on('error', function (err, client) {
			console.log("PG Pool has encountered an error!");
			if (err) {
				console.log(err);
			}
			if (client) {
				console.log(client);
			}
			this.pool = null;
		});
		return this.pool;
	}
};

db.getConnection();

module.exports = db;