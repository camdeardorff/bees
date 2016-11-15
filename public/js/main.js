/**
 * Created by Cam on 11/7/16.
 */
// ~/.npm-packages/bin/browserify main.js -o bundle.js


var $ = require("jquery");
var moment = require('moment-timezone');
var Chart = require('chart.js');





function getDataAtTimeZone(tz, callback) {
	$.ajax({
		method: "GET",
		url: "http://localhost:3000/soundReport/today/" + tz,
		contentType: 'application/json',
		dataType: 'json',
		error: function (request, status, error) {
			console.log(request);
			console.log(status);
			console.log(error);
			callback(error);
		},
		success: function (data) {
			console.log(data);
			callback(null, data);
		}
	});
}


var tz = moment.tz.guess();
if (tz) {
	tz = tz.replace("/", "*=SLASH=*");
}
console.log("guessed time zone: ", tz);

getDataAtTimeZone(tz, function (err, data) {
	console.log("got data: ", data);
	if (data.success) {
		var records = data.records;

		var times = [];
		var decibels = [];

		for (var i = 0; i < records.length; i++) {
			var record = records[i];

			times.push(record.range.to);
			decibels.push(record.decibels);
		}


		var ctx = document.getElementById("myChart");
		var myChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: times,
				datasets: [{
					label: '# of Votes',
					data: decibels,
					backgroundColor: [
						'rgba(255, 99, 132, 0.2)',
						'rgba(54, 162, 235, 0.2)',
						'rgba(255, 206, 86, 0.2)',
						'rgba(75, 192, 192, 0.2)',
						'rgba(153, 102, 255, 0.2)',
						'rgba(255, 159, 64, 0.2)'
					],
					borderColor: [
						'rgba(255,99,132,1)',
						'rgba(54, 162, 235, 1)',
						'rgba(255, 206, 86, 1)',
						'rgba(75, 192, 192, 1)',
						'rgba(153, 102, 255, 1)',
						'rgba(255, 159, 64, 1)'
					],
					borderWidth: 1
				}]
			},
			options: {
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true
						}
					}]
				}
			}
		});
	}
});

