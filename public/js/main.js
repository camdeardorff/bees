/**
 * Created by Cam on 11/7/16.
 */
// ~/.npm-packages/bin/browserify main.js -o bundle.js


var moment = require('moment-timezone');
var Chart = require('chart.js');
var SERVER_LOCATION = "https://cafbees.herokuapp.com";


function showLoadingGif() {
	var loadingGif = $("#loading-gif").show(200);
}
function hideLoadingGif() {
	var loadingGif = $("#loading-gif").hide(200);
}

function getDataAtTimeZone(tz, callback) {
	showLoadingGif();
	$.ajax({
		method: "GET",
		url: SERVER_LOCATION + "/soundReport/today/" + tz,
		contentType: 'application/json',
		dataType: 'json',
		error: function (request, status, error) {
			console.log(request);
			console.log(status);
			console.log(error);
			hideLoadingGif();
			callback(error);

		},
		success: function (data) {
			hideLoadingGif();
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
					label: 'MVNU Caf Noise Volume',
					data: decibels,
					backgroundColor: 'rgba(0, 188, 255, 0.6)',
					borderColor: 'rgba(51, 51, 51, 1)',
					borderWidth: 1
				}]
			},
			options: {
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: false
						}
					}]
				},

				animation: {
					duration: 1000,
					easing: "easeInCubic"
				}
			}
		});
	}
});

