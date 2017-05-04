const hyperdom = require('hyperdom');
const h = hyperdom.html;

var selectConstituency,
    findConstituency,
    self;

class Map {
  constructor() {

  }

  selectConstituency(key) {
    ukMap.fitBounds(self.findConstituency(key).getBounds(), {
      padding: [100,100]
    });
  }

  onload() {
    try { //This is a hack! We need to stop this from attempting to rerender as Leaflet doesn't like it.
      $('#ukMap').ready(function() {
        self = this;
        self.constituencies = {};
        self.constituencyFeatures;

        setTimeout(function() { //CLEARLY THIS IS NOT A GOOD WAY OF DOING THINGS!

          this.ukMap = L.map('ukMap', {
            center: [54.505, -4.09],
            zoom: 6,
            scrollWheelZoom: false
          });

          L.tileLayer('https://api.mapbox.com/styles/v1/jeremynevans/cj27w58m8001t2smzpntviyhw/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamVyZW15bmV2YW5zIiwiYSI6ImNqMjd3MGl2azAwNmsyd25zOW5zYWFtbncifQ.p0EZjsWStzknkgEyBOHrfA', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.light'
          }).addTo(ukMap);

          constituencyData.features.forEach(function(feature) {
            feature.properties.currentParty = {
              key: 'labour',
              name: 'Labour',
              color: 'red'
            };
          })

          function style(feature) {
            return {
              fillColor: feature.properties.currentParty.color,
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
            info.update(layer.feature.properties);
          }
          function resetHighlight(e) {
            self.constituencyFeatures.resetStyle(e.target);
            info.update();
          }
          self.findConstituency = function(key) {
            var feature = this.constituencyFeatures.eachLayer(function(layer) {
              if (layer.feature.properties.pcon16cd == key) {
                return layer
              }
            })
            return feature;
          }

          function zoomToFeature(e) {
            ukMap.fitBounds(e.target.getBounds(), {
              padding: [100,100]
            });
          }
          function onEachFeature(feature, layer) {
            // console.log(feature);
            var key = feature.properties.pcon16cd;
            self.constituencies[key] = feature;
            self.constituencies[key].getBounds = feature.getBounds;
            layer.on({
              mouseover: highlightFeature,
              mouseout: resetHighlight,
              click: zoomToFeature
            });
          }


          self.constituencyFeatures = L.geoJson(constituencyData, {
            style: style,
            onEachFeature: onEachFeature,
            zoomSnap: 0.5
          }).addTo(ukMap);

          self.findConstituency("E14000885");
          self.findConstituency("E14000577");

          var info = L.control();

          info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
            this.update();
            return this._div;
          };

          // method that we will use to update the control based on feature properties passed
          info.update = function (props) {
            console.log(props);
            this._div.innerHTML = (props ?
              '<h4>' + props.pcon16nm + '</h4><p>Current Party: <b>' + props.currentParty.name + '</b></p>'
              : 'Hover over a constituency');
          };

          info.addTo(ukMap);



        },1000);
      });
    } catch(e) {

    }
  }

  render() {
    return h('div#ukMap', '');
  }
}

selectConstituency = Map.selectConstituency;
findConstituency = Map.findConstituency;

module.exports = Map;
