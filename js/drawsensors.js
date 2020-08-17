const consistent_highlight = []
const MARKERS = {}
var grouped_data;


function loadData(map) {
	$.getJSON("simple.json", function(data){
		const lat_lng_set = new Set()
		$.each(data, function(){
			const {name, latitude, longitude, avg_db} = this;
			var color = "#004BBD";
			if(avg_db < 20) {
				color = "#238823"
			} else if(avg_db < 35) {
				color = "#007000";
			} 
			const pos_str = latitude+","+longitude
			if(!lat_lng_set.has(pos_str)) {
				lat_lng_set.add(pos_str)
			} else {
				return 1;
			}
			console.log(this);
			MARKERS[name] = L.circleMarker([latitude, longitude], {color: color }).bindPopup(name+"<br>Decibels: "+avg_db).addTo(map);
		});
	});
}


const map = L.map('county-map').setView([40.657052, -74.038430], 12);

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

