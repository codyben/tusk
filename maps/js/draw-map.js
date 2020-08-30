consistent_highlight = []
var curr_age_group = "young";
var map;
var geojson;
const STEEL = new Rainbow();
STEEL.setNumberRange(0,30);
STEEL.setSpectrum("#bed8ec", "#125ca4"); //https://vega.github.io/vega/docs/schemes/
	//console.log(statesData)
  map = L.map('county-map').setView([40.995786, -77.585395], 6);

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
  
  var info = L.control();
//   L.DomEvent.disableClickPropagation(div);

	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};

	info.update = function (props) {
		console.log(props)
		this._div.innerHTML = (props ?
			' <h4>'+props.NAME+'</h4><b></b><br />'+props.HEARINGDATA[curr_age_group]+' out of every 100 have a hearing disability '
			:  '<h4>Hearing Disability Prevalence by Age Group & State</h4><br> Hover over a state to view the number of people out a 100 who suffer from a hearing disability.');
	};

	info.addTo(map);


	// get color depending on population density value
	function getColor(d) {

		return "#"+STEEL.colourAt(d);
		
	}


	function style(feature) {
		return {
			weight: 1,
			opacity: 1,
			color: 'gray',
			dashArray: '3',
			fillOpacity: 0.7,
			fillColor: getColor(feature.properties.HEARINGDATA[curr_age_group])
		};
	}

	function s_style(feature) {
		console.log(feature)
		return {
			weight: 4,
			opacity: 1,
			color: 'black',
			dashArray: '3',
			fillOpacity: 1,
			fillColor: getColor(feature.properties.HEARINGDATA.young)
		};
	}

	function highlightFeature(e) {
		var layer = e.target;
		if(consistent_highlight.length == 0) {
			consistent_highlight.push(layer)
		} else {
			resetHighlight(consistent_highlight.pop())
			consistent_highlight.push(e)
		}

		layer.setStyle({
			weight: 2,
			color: '#666',
			dashArray: '',
			fillOpacity: 0.7
		});

		if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
			layer.bringToFront();
		}

		info.update(layer.feature.properties);
	}


	function resetHighlight(e) {
		geojson.resetStyle(e.target);
		info.update();
	}

	function zoomToFeature(e) {
		map.fitBounds(e.target.getBounds());
	}

	function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			click: highlightFeature,
			mouseout: resetHighlight,
		});
	}


	function redrawLayers(new_age) {
		$("."+curr_age_group).removeClass("activeage");
		curr_age_group = new_age;
		geojson.removeFrom(map);
		geojson = L.geoJson(hearingData, {
			style: style,
			onEachFeature: onEachFeature
		}).addTo(map);
		$("."+curr_age_group).addClass("activeage");
	}
	// L.geoJson(state_outlines, {
	// 	style: s_style,
	// }).addTo(map)
	geojson = L.geoJson(hearingData, {
		style: style,
		onEachFeature: onEachFeature
	}).addTo(map);


	map.attributionControl.addAttribution('US CDC');


	var legend = L.control({position: 'bottomright'});

	legend.onAdd = function (map) {

		var div = L.DomUtil.create('div', 'info legend'),
			grades = ["1%", "2%", "3%", "5%", "7%", "10%", "13%", "16%", "20%", "24%", "30%"],
			labels = [],
			from, to;

		for (var i = 0; i < grades.length; i++) {
			aff = grades[i].replace("%", "");
			
			labels.push(
				'<i style="background:' + getColor(aff) + '"></i> ' +aff+"%"+
				(to ? '&ndash;': ''));
		}

		div.innerHTML = labels.join('<br>');
		return div;
	};

	legend.addTo(map);

	var ageSelector = L.control({position: 'bottomleft'});
	ageSelector.onAdd = function () {
		const div = L.DomUtil.create("div", "info left");
		div.innerHTML = `
		<h5>Select Age Group</h5>
		<button class="old" onclick="redrawLayers('old');">65+</button>
		<button class="mid" onclick="redrawLayers('mid');">45-65</button>
		<button class="young activeage" onclick="redrawLayers('young');">18-44</button>`;
		return div;
	};
	ageSelector.addTo(map);

	$( document ).ready(() => {
		$("#entry").modal("toggle");
	});