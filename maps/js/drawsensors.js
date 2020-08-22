'use strict';
const consistent_highlight = [];
const MARKERS = {};
const CIRCLE_MARKERS = {};
const PULSERS = {};
const RELATIVE_VOLUME = {};
const NEEDED_AUDIO_FILES = {};
const AUDIO_OBJECTS = {};
const years = new Set([2019]);
var grouped_data;
const MEDIAN_SPL = 31.63172027543478;
const MEDIAN_MOD = 120;
const MEDIAN_PULSE = 6;
const vol_ratio = (100/132)/100;
const RAINBOW = new Rainbow();
const DISTANCE_COLOR = new Rainbow();
const POLYLINES = [];
const CURR_SOUNDS = [];
var myMovingMarker;
const RUNNING_AUDIO = {};
const HOST = "https://audio.codyben.me/audio/";
var animation_interval_handle;
RAINBOW.setNumberRange(21,132);
RAINBOW.setSpectrum("#bed8ec", "#125ca4"); //https://vega.github.io/vega/docs/schemes/
DISTANCE_COLOR.setNumberRange(0, 0.1);
DISTANCE_COLOR.setSpectrum("#ffed39", "#245447");
const marker_loc = new L.LatLng(40.7134534, -73.9722389);


function lets_go() {
	console.log(marker_loc);
	map.flyTo(marker_loc);
	$.each($(".year-checkboxes div input"), function() {
		const t = $(this);
		if(t.is(":checked")) {
			years.add(t.data("year"));
		}
	});
	if(years.has(2019) && (years.size == 1)) {
		return;
	}
	$.each(map._layers, function(){
		if("_url" in this) {
			return 1;
		}
		this.remove();
	});
	loadData(map);
}

function play_audio(t) {
	const wav_id = $(t).data("id");
	console.log(wav_id);
	if(!(wav_id in AUDIO_OBJECTS)) {
		// const mp3_url = "/00_000066.mp3";
		// console.log(mp3_url);
		const needed = NEEDED_AUDIO_FILES[wav_id];
		AUDIO_OBJECTS[wav_id] = {"audio":new Audio(needed.audio), "meta": {"volume": needed.true_vol, "isPlaying": false}};
	}
	const curr_audio = AUDIO_OBJECTS[wav_id]["audio"];
	curr_audio.volume = AUDIO_OBJECTS[wav_id]["meta"].volume
	console.log(curr_audio);
	curr_audio.addEventListener("canplay", function(){
		this.play().catch((e)=>{console.warn("failed to play individual track.")});
	});
}
// https://stackoverflow.com/questions/37115491/how-to-set-volume-of-audio-object
function distance(lat1, lon1, lat2, lon2, unit) {
    //https://www.geodatasource.com/developers/javascript
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    } else {
        const radlat1 = Math.PI * lat1 / 180;
        const radlat2 = Math.PI * lat2 / 180;
        const theta = lon1 - lon2;
        const radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") { dist = dist * 1.609344 }
        if (unit == "N") { dist = dist * 0.8684 }
        return dist;
    }
}

function createMarkers(data){
	const lat_lng_set = new Set();
	const ls = window.localStorage.getItem("markerdata");
	if(!ls) {
		window.localStorage.setItem("markerdata", JSON.stringify(ls));
	}
	$.each(data, function(){
		
		$.each(this, function(){
			// console.log(this);
			const {name, latitude, longitude, avg_db, modified_db, timestamp, year} = this;
			// console.log(year);
			// console.log(modified_db);
			if(!(years.has(year))) {
				return 1;
			}
			const rel_vol = (modified_db/132).toFixed(2);
			const tru_vol = modified_db*vol_ratio;
			const color = RAINBOW.colourAt(modified_db);
			const pulse_ratio = modified_db/MEDIAN_MOD;
			const bias = (pulse_ratio <= 0) ? 3.5 : -5.2;
			const pulse_rate = MEDIAN_PULSE + (bias * pulse_ratio**2);
			const pos_str = latitude+","+longitude
			if(!lat_lng_set.has(pos_str)) {
				lat_lng_set.add(pos_str)
				const mp3 = HOST+name.replace("wav", "mp3");
				NEEDED_AUDIO_FILES[name] = {"audio": mp3, "meta": HOST+name+".json", "true_vol": tru_vol, "ts": timestamp};
			} else {
				// console.log(pos_str);
				// console.log(year);
				return 1;
			}
			// console.log(this);
			const pulse_boi = L.icon.pulse({iconSize:[20,20],color: "#"+color});
			// console.log(pulse_boi);
			PULSERS[name] = pulse_boi;
			const [__,_, uniq_class] = (pulse_boi.options.className).split(" ");
			// console.log(uniq_class);
			MARKERS[name] = L.marker([latitude, longitude], {icon:pulse_boi, opacity:1}).bindPopup(`
			<div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
				<div class="btn-group mr-2" role="group" aria-label="First group">
					<button type="button" class="2016 btn btn-secondary ${(year == 2016) ? "active" : "disabled"}">2016</button>
					<button type="button" class="2017 btn btn-secondary ${(year == 2017) ? "active" : "disabled"}">2017</button>
					<button type="button" class="2018 btn btn-secondary ${(year == 2018) ? "active" : "disabled"}">2018</button>
					<button type="button" class="2019 btn btn-secondary ${(year == 2019) ? "active" : "disabled"}">2019</button>
				</div>
				<div class="btn-group mr-2" role="group" aria-label="First group">
					<button type="button" class="btn btn-secondary">${Math.ceil(avg_db)}dB</button>
					<button type="button" class="btn btn-secondary">${Math.ceil((tru_vol.toFixed(2))*100)}%</button>
					<button type="button" data-id="${name}" onclick="play_audio(this);" class="btn btn-secondary">Play current sound</button>
				</div>
			</div>
		`).addTo(map);
			$("."+uniq_class).css("animation-duration", ""+pulse_rate+"s");
			// console.log($("."+uniq_class).css("animation-duration"));
			const curr_marker = L.circleMarker([latitude, longitude], {color: "#"+color}).addTo(map);
			curr_marker.on('click', function(){
				const m = this;
				$.each(years, function(){
					$("."+this).addClass("active");
				});
			});
			CIRCLE_MARKERS[name] = curr_marker;
			RELATIVE_VOLUME[name] = modified_db;
		});
	});
}

function loadData(map) {
	myMovingMarker = L.marker(marker_loc, {
		draggable: true
		}).addTo(map);
	const entrybtn = $(".entry-button");
	$("#entry").modal({
		"backdrop": "static",

	}).modal("show");
	try{
		const ls = window.localStorage.getItem("markerdata");
		if(ls != "null") {
			createMarkers(JSON.parse(ls));
		} else{
			$.getJSON("grouped.json",createMarkers);
		}
	} catch(e) {
		console.warn("Failed to initialize");
		console.error(e.message);
		entrybtn.text("Error. Try refreshing the page.");
		entrybtn.removeClass("btn-secondary").addClass("btn-danger");
	}
	entrybtn.removeAttr("disabled");
	entrybtn.text("Let's Get Started!");
	entrybtn.removeClass("btn-secondary").addClass("btn-success").removeClass("disabled");


	
}


const map = L.map('county-map').setView([40.676310, -74.014676], 16);


L.tileLayer('https://api.mapbox.com/styles/v1/bencodyoski/ck7v6s6vf06sl1jpt9lnqpoqx/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYmVuY29keW9za2kiLCJhIjoiY2s1c2s0Y2JmMHA2bzNrbzZ5djJ3bDdscyJ9.7MuHmoSKO5zAgY0IKChI8w', {
	maxZoom: 18,
	minZoom: 14,
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
		'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	id: 'mapbox/light-v9'
}).addTo(map);
// L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYmVuY29keW9za2kiLCJhIjoiY2s1c2s0Y2JmMHA2bzNrbzZ5djJ3bDdscyJ9.7MuHmoSKO5zAgY0IKChI8w', {
// 	maxZoom: 18,
// 	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
// 		'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
// 		'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
// 	id: 'mapbox/light-v9'
//  }).addTo(map);



var geojson;

function resetHighlight(e) {
	geojson.resetStyle(e.target);
	info.update();
}


map.attributionControl.addAttribution('NYU SONYC');

loadData(map);

$( document ).ready(function(){
	const get_audio_to_be_played = function() {
		$.each(POLYLINES, function(){
			this.removeFrom(map);
		});
		CURR_SOUNDS.length = 0;
		POLYLINES.length = 0;
		// console.log("removing");
			const {lat, lng} = myMovingMarker.getLatLng();
			// var within_range = false;
			$.each(CIRCLE_MARKERS, function(k,_){
				const coords = this.getLatLng();
				const mLat = coords["lat"];
				const mLng = coords["lng"];
				const dist = distance(lat, lng, mLat, mLng);
				const true_vol = NEEDED_AUDIO_FILES[k].true_vol;
				// console.log(dist);
				if(dist <= 1) {
					// within_range = true;

					// console.log("LESS THAN");
					if(!(k in AUDIO_OBJECTS)) {
						// console.log("here");
						// console.log(k);
						const mp3_url = NEEDED_AUDIO_FILES[k].audio;
						// const mp3_url = "/00_000066.mp3";
						// console.log(mp3_url);
						AUDIO_OBJECTS[k] = {"audio":new Audio(mp3_url), "meta": {"volume": true_vol, "isPlaying": false}};
						AUDIO_OBJECTS[k]["audio"].volume = 0;
						AUDIO_OBJECTS[k]["audio"].loop = true;
						// console.log(AUDIO_OBJECTS[k].load());
					} 
				} else {
					// within_range = false;
					return 1;
				}
				const curr_audio = AUDIO_OBJECTS[k].audio;
				const audio_meta = AUDIO_OBJECTS[k].meta;
				// console.log(k);
				// console.log(curr_audio);
				if(dist <= 0.14 && (curr_audio.paused || !curr_audio.currentTime) && !audio_meta.isPlaying) {
					// console.log("first play");
					var latlngs = Array();
					//Get latlng from first marker
					latlngs.push(coords);
					//Get latlng from first marker
					latlngs.push(myMovingMarker.getLatLng());

					//You can just keep adding markers

					//From documentation http://leafletjs.com/reference.html#polyline
					// create a red polyline from an arrays of LatLng points
					POLYLINES.push(L.polyline(latlngs, {color: "#"+DISTANCE_COLOR.colourAt(dist)}).addTo(map));
					// console.log(polyline);
					audio_meta.isPlaying = true;

					// console.log(audio_meta);
					curr_audio.play().catch((e)=>{
						console.warn("failed to play audio.");
					});

					// $(curr_audio).animate({volume: audio_meta.volume}, 49);
				} else if(dist <= 0.14 && !curr_audio.ended && audio_meta.isPlaying) {
					var latlngs = Array();
					//Get latlng from first marker
					// console.log("volume raise");
					latlngs.push(coords);
					// console.log(curr_audio.volume);
					if(!$(curr_audio).is(":animated")) {
						const dist_ratio = (0.14 - dist) / 0.14;
						$(curr_audio).animate({volume: audio_meta.volume*dist_ratio}, 50);
					}

					//Get latlng from first marker
					latlngs.push(myMovingMarker.getLatLng());
					//You can just keep adding markers
					curr_audio.play().catch((e)=>{
						console.warn("failed to play audio.");
					});
					//From documentation http://leafletjs.com/reference.html#polyline
					// create a red polyline from an arrays of LatLng points
					// console.log("pushing");
					// CURR_SOUNDS.push({"distance":Math.floor((dist*5280)), "sound":true_vol});
					POLYLINES.push(L.polyline(latlngs, {color: "#"+DISTANCE_COLOR.colourAt(dist)}).addTo(map));
				}

				if(dist > 0.14 && (!curr_audio.paused || curr_audio.currentTime)) {
					audio_meta.isPlaying = false;
					// console.log("out of range");
					if(!$(curr_audio).is(":animated")) {
						$(curr_audio).animate({volume: 0}, 50, function(){
							this.pause();
						});
					}
					// curr_audio.pause();
				}
							
			});

	};
	// const myMovingMarker = L.Marker.movingMarker([[40.728380, -73.994243],[40.731681, -74.000905]],
	// 	[60000]).addTo(map);
	// //...
	// myMovingMarker.start();
	// myMovingMarker.addEventListener("end", function(){
	// 	clearInterval(animation_interval_handle);
	// });
	
		// myMovingMarker.on('drag', get_audio_to_be_played);
	animation_interval_handle = setInterval(get_audio_to_be_played, 75);
});
$.each(years, function(){
	const selector = $("#"+this+"-check");
	selector.attr("checked", null).parent().addClass("active");
});