var version = require("./package.json").version;
var exec    = require('child_process' ).exec;
var rb	    = require('radio-browser');

var debug = beo.debug;

var defaultSettings = { "favourites": {} };
var settings = JSON.parse(JSON.stringify(defaultSettings));

var search_results;
var found_stations = {};

beo.bus.on('general', function(event) {
	if (event.header == "activatedExtension") {
		if (event.content.extension == "radio") {
			beo.sendToUI("radio", {
				header: "homeContent", 
				content: {
					favourites: settings.favourites 
				}
			});
		}
	}
});

beo.bus.on('radio', function(event) {
	switch (event.header) {
		case "settings":
			if (event.content.settings) {
				settings = Object.assign(settings, event.content.settings);
			}

			break;
		case "search":
			var query = {
				name: event.content,
				hidebroken: true,
				order: "votes",
				limit: 100
			};
			rb.searchStations(query).then(function(search_results) {
				found_stations = {};
				
				for (i in search_results) {
					console.log(search_results[i]);

					var station = search_results[i];
					if (station.codec === "wma") {
						continue;
					}

					found_stations[station.stationuuid] = station;
					if (settings.favourites[station.stationuuid] &&
						settings.favourites[station.stationuuid].isFavourite) {
						found_stations[station.stationuuid].isFavourite = true;
					}
				}

				beo.sendToUI("radio", {header: "searchResults", content: { found_stations }});
			}).catch(function(err) {
				if (err && debug) {
					console.log(err);
				}
			})

			break;
		case "play":
			exec('/opt/hifiberry/bin/start-radio "'+ event.content.URL +'" "'+event.content.stationName+'"', 
				function(error, stdout, stderr) {
					if (error) {
						if (debug) console.error("Starting radio failed: "+error, stderr);
						} else {
						if (debug) console.log("Starting radio finished.", stdout);
						}
				}
			)

			if (beo.extensions.sources && beo.extensions.sources.setSourceOptions) {
			    beo.extensions.sources.setSourceOptions("radio", {
				    aliasInNowPlaying: event.content.stationName
			    }, true);
			}

			break;
		case "add-to-favourite":
			if (!settings.favourites[event.content.stationId]) {
				settings.favourites[event.content.stationId] = {
					title: found_stations[event.content.stationId].name,
					img: found_stations[event.content.stationId].favicon,
					url: found_stations[event.content.stationId].url
				}
				isFavourite = true;
			} else {
				delete settings.favourites[event.content.stationId]
				isFavourite = false;
			}

			beo.sendToUI("radio", {
				header: "stationFavourited", 
				content: { 
					guide_id: event.content.stationId, 
					isFavourite: isFavourite 
				}
			});
			beo.sendToUI("radio", {
				header: "homeContent", 
				content: {
					favourites: settings.favourites 
				}
			});
			beo.saveSettings("radio", settings);

			break;
	}
});

function checkMPDStatus(callback) {
	if (beo.extensions.mpd && beo.extensions.mpd.isEnabled) {
		beo.extensions.mpd.isEnabled(callback);
	}
}

module.exports = {
	version: version,
	isEnabled: checkMPDStatus
};
