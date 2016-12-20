/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var mysql = require('mysql');
var settings = require('../config/database-config.json');

var db = function () {
	this.pool = mysql.createPool(settings.production);
};

db.query = function (sqlString, values, callback) {
	if (!this.pool) {
		this.pool = mysql.createPool(settings.production);
	}

	this.pool.getConnection(function (err, connection) {
		if (err) {
			callback(err);
		} else {
			var q = connection.query(sqlString, values, function (err, rows, results) {
				callback(err, rows, results);
				connection.release();
			});
			console.log(q.sql);
		}
	});
};

module.exports = db;