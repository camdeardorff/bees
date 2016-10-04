/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var mysql = require('mysql');
var settings = require('../config/database-config.json');



var db = function () {
	this.connection = null;
};

db.getConnection = function () {
	if (db.connection) {
		return db.connection;
	} else {
		this.connection = mysql.createConnection(settings.production);

		this.connection.connect(function(err){
			if(!err) {
				console.log('Database is connected!');
			} else {
				console.log('Error connecting database!');
				console.log(err);
			}
		});
		this.connection.on('error', function (err) {
			// console.log('db error', err);
			if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
				console.log("Connection to database was lost. Idle without connection until we need it.");
				db.connection = null;
				//setTimeout(db.getConnection, 2000);
			} else {
				// console.log("PROTOCOL_CONNECTION_LOST TRUE");
				throw err;
			}
		})
	}
	return this.connection;
};

db.getConnection();



module.exports = db;