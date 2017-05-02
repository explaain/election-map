const hyperdom = require('hyperdom');
const h = hyperdom.html;
const router = require('hyperdom-router');

const routes = {
  home:  router.route('/'),
  contacts: router.route('/contacts'),
};

class Map {
  constructor() {

  }

  onload() {
    $('#ukMap').ready(function() {
      setTimeout(function() { //CLEARLY THIS IS NOT A GOOD WAY OF DOING THINGS!
        var geojson,
        ukMap = L.map('ukMap').setView([54.505, -4.09], 6);

        L.tileLayer('https://api.mapbox.com/styles/v1/jeremynevans/cj27w58m8001t2smzpntviyhw/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamVyZW15bmV2YW5zIiwiYSI6ImNqMjd3MGl2azAwNmsyd25zOW5zYWFtbncifQ.p0EZjsWStzknkgEyBOHrfA', {
          attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
          maxZoom: 18,
          id: 'mapbox.light'
        }).addTo(ukMap);

        function getColor(d) {
          return 'rgba(0,0,200,' + (Math.random()*0.5+0.25) + ')';
        }
        function style(feature) {
          return {
            fillColor: getColor(),
            weight: 1,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7
          };
        }
        function highlightFeature(e) {
          var layer = e.target;

          layer.setStyle({
            weight: 3,
            color: '#0044aa',
            dashArray: '',
            fillOpacity: 0.7
          });

          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
          }
        }
        function resetHighlight(e) {
          geojson.resetStyle(e.target);
        }
        function zoomToFeature(e) {
          ukMap.fitBounds(e.target.getBounds(), {
            padding: [100,100]
          });
        }
        function onEachFeature(feature, layer) {
          layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
          });
        }

        geojson = L.geoJson(constituencyData, {
          style: style,
          onEachFeature: onEachFeature,
          zoomSnap: 0.5
        }).addTo(ukMap);




        //Saving for when we do events
        function onMapClick(e) {
          // alert("You clicked the map at " + e.latlng);
        }
        ukMap.on('click', onMapClick);
      },1000);
    });
  }

  render() {
    return h('div#ukMap', '');
  }
}

module.exports = Map;
