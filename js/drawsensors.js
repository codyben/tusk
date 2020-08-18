const consistent_highlight = [];
const MARKERS = {};
const CIRCLE_MARKERS = {};
const PULSERS = {};
const RELATIVE_VOLUME = {};
var grouped_data;
const MEDIAN_SPL = 31.63172027543478;
const MEDIAN_MOD = 120;
const MEDIAN_PULSE = 5;
const RAINBOW = new Rainbow();
RAINBOW.setNumberRange(21,132);
RAINBOW.setSpectrum("#bed8ec", "#125ca4"); //https://vega.github.io/vega/docs/schemes/

// https://stackoverflow.com/questions/37115491/how-to-set-volume-of-audio-object


function loadData(map) {
	$.getJSON("grouped.json", function(data){
		const lat_lng_set = new Set()
		$.each(data, function(){
			$.each(this, function(){
				const {name, latitude, longitude, avg_db, modified_db} = this;
				const color = RAINBOW.colourAt(modified_db);
				const pulse_ratio = modified_db/MEDIAN_MOD;
				const bias = (pulse_ratio <= 0) ? 1.5 : -3.5;
				const pulse_rate = MEDIAN_PULSE + (bias * pulse_ratio**2);
				const pos_str = latitude+","+longitude
				if(!lat_lng_set.has(pos_str)) {
					lat_lng_set.add(pos_str)
				} else {
					return 1;
				}
				// console.log(this);
				const pulse_boi = L.icon.pulse({iconSize:[20,20],color: "#"+color});
				// console.log(pulse_boi);
				PULSERS[name] = pulse_boi;
				const [__,_, uniq_class] = (pulse_boi.options.className).split(" ");
				// console.log(uniq_class);
				MARKERS[name] = L.marker([latitude, longitude], {icon:pulse_boi, opacity:1}).addTo(map);
				$("."+uniq_class).css("animation-duration", ""+pulse_rate+"s");
				console.log($("."+uniq_class).css("animation-duration"));
				CIRCLE_MARKERS[name] = L.circleMarker([latitude, longitude], {color: "#"+color}).bindPopup(name+"<br>Decibels: "+avg_db+"<br>Relative volume: "+modified_db+"%").addTo(map);
				RELATIVE_VOLUME[name] = modified_db;
			});
		});
	});
}


const map = L.map('county-map').setView([40.657052, -74.038430], 18);

L.tileLayer('https://api.mapbox.com/styles/v1/bencodyoski/ck7v6s6vf06sl1jpt9lnqpoqx/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYmVuY29keW9za2kiLCJhIjoiY2s1c2s0Y2JmMHA2bzNrbzZ5djJ3bDdscyJ9.7MuHmoSKO5zAgY0IKChI8w', {
	maxZoom: 18,
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

