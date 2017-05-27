const hyperdom = require('hyperdom');
const partyReconciliation = require('../../public/data/partyReconciliation');
const h = hyperdom.html;

var selectConstituency,
    deselectConstituency,
    findConstituency;

class Map {


  constructor(outboundSelectConstituency,outboundDeselectConstituency) {
    const self = this;
    self.constituencies = {};
    self.constituencyFeatures;
    self.findConstituency;
    self.outboundSelectConstituency = outboundSelectConstituency;
    self.outboundDeselectConstituency = outboundDeselectConstituency;
  }

  selectConstituency(key) {
    const self = this;
    const constituency = self.findConstituency(key);
    if(constituency!==undefined){
      self.ukMap.fitBounds(constituency.getBounds(), {
        padding: [100,100]
      });
      self.specialHighlightFeature(constituency);
    } else {
      console.log("Constituency not found by a key " + key + ". This is probably a Northern Ireland one.")
    }

  }

  deselectConstituency() {
    const self = this;
    self.ukMap.setView([54.505, -4.09],6);
    self.deselectLayer();
    $("#search-input").val("");
  }

  onload() {

  }

  render() {
    const self = this;
    if(Model.constituenciesData.length>0){
      $('#ukMap').ready(function() {
        const map = this;


        setTimeout(function() { //CLEARLY THIS IS NOT A GOOD WAY OF DOING THINGS!
          try { //This is a hack! We need to stop this from attempting to rerender as Leaflet doesn't like it.

            map.ukMap = L.map('ukMap', {
              center: [54.505, -4.09],
              zoom: 6,
              scrollWheelZoom: false
            });
            self.ukMap = map.ukMap;

            $('#ukMap').addClass("initialized");

            L.tileLayer('', {
              attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>' /* + ', Imagery © <a href="http://mapbox.com">Mapbox</a>'*/,
              maxZoom: 18,
            }).addTo(map.ukMap);



            const searchData = Model.constituenciesData;
            const getParty = function(key) {
              var party = allParties.filter(function(party) {
                return party.key == key;
              })[0];
              if (!party) {
                party = {key: key, name: key, color: 'gray'}
              } else {
                if (!party.key) {party.key = key}
                if (!party.name) {party.name = party.key}
                if (!party.color) {party.color = 'lightgray'}
              }
              return party;
            }

            var collectParties = [];
            const partySeats = {};
            constituencyData.features.forEach(function(feature) {
              var data = searchData.filter(function(item){
                return item.objectID == feature.properties.pcon16cd;
              })[0];
              // Checking if at least one party exists in the list
              // and its share is greater than 0

              if(data&&data.results[0]&&data.results[0].share>0){
                if(!partySeats[partyReconciliation[data.results[0].party]]){
                  partySeats[partyReconciliation[data.results[0].party]] = 0;
                }
                partySeats[partyReconciliation[data.results[0].party]]++;
                // Populating map
                var partyKey = data.results[0].party;
                if (collectParties.indexOf(partyKey) == -1) {
                  collectParties.push(partyKey)
                }
                var party = getParty(partyKey);
                feature.properties.currentParty = {
                  key: partyKey,
                  name: party.name,
                  color: party.color
                };
              } else {
                // Otherwise - no data
                feature.properties.currentParty = {
                  color: "lightgray"
                };
              }
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
              $(".leaflet-interactive.hover").attr("class","leaflet-interactive")
              if(!$(layer.getElement()).attr("class").match(/selected/)){
                $(layer.getElement()).attr("class","leaflet-interactive hover")
              }
              info.update(layer.feature.properties);

            }
            self.specialHighlightFeature = function(layer) {
              if(Model.selectedConstituencyLayer===layer){
                self.outboundDeselectConstituency();
              } else {
                Model.selectedConstituencyLayer = layer;
                $(".leaflet-interactive.selected").attr("class","leaflet-interactive")
                $(layer.getElement()).attr("class","leaflet-interactive selected")
                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                  layer.bringToFront();
                }
                info.update(layer.feature.properties);
                setTimeout(function(){
                  $('html, body').animate({
                    scrollTop: $(".card.table").offset().top - 20
                  }, 500);
                },500)
              }
            }
            self.resetHighlight = function(e){
              if(!$(e.target.getElement()).attr("class").match(/selected/)){
                $(e.target.getElement()).attr("class","leaflet-interactive")
              }
              info.update();
            }

            self.deselectLayer = function(){
              const layer = Model.selectedConstituencyLayer;
              //$(".leaflet-interactive").attr("class","")
              $(layer.getElement()).attr("class","leaflet-interactive")
              //$(".progress,.seats,.name").hide();
              //setTimeout(function(){$(".progress,.seats,.name").show();})
              //info.update(layer.feature.properties);
            }
            self.findConstituency = function(key) {
              var layers = self.constituencyFeatures._layers;
              var layerKeys = Object.keys(layers);
              var myFeatureKey = layerKeys.filter(function(layerKey) {
                return layers[layerKey].feature.properties.pcon16cd == key;
              })[0];
              var myFeature = layers[myFeatureKey];

              console.log('myFeature');
              console.log(myFeature);

              var info = L.control();

              info.onAdd = function (map) {
                this._div = L.DomUtil.create('div', 'deselect'); // create a div with a class "info"
                this.update();
                return this._div;
              };
              //TODO: Jeremy, please improve text "No results yet"
              // method that we will use to update the control based on feature properties passed
              info.update = function (props) {
                this._div.innerHTML = "Click to deselect constituency ";
                L.DomUtil.setPosition(this._div, L.point([myFeature.feature.properties.lat,myFeature.feature.properties.long]))
              };

              // info.addTo(map.ukMap);

              return myFeature;
            }

            function zoomToFeature(e) {
              $("#search-input").val(e.target.feature.properties.pcon16nm);
              self.outboundSelectConstituency(e.target.feature.properties.pcon16cd);
            }
            function onEachFeature(feature, layer) {
              var key = feature.properties.pcon16cd;
              self.constituencies[key] = feature;
              self.constituencies[key].getBounds = feature.getBounds;
              layer.on({
                mouseover: highlightFeature,
                mouseout: self.resetHighlight,
                click: zoomToFeature
              });
            }


            self.constituencyFeatures = L.geoJson(constituencyData, {
              style: style,
              onEachFeature: onEachFeature,
              zoomSnap: 0.5
            }).addTo(map.ukMap);


            var info = L.control();

            info.onAdd = function (map) {
              this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
              this.update();
              return this._div;
            };
            //TODO: Jeremy, please improve text "No results yet"
            // method that we will use to update the control based on feature properties passed
            info.update = function (props) {
              this._div.innerHTML = (props ?
                '<h4>' + props.pcon16nm + '</h4><p>Current Party: <b>' + (props.currentParty.name||"No results yet") + '</b></p>'
                : 'Hover over a constituency');
            };

            info.addTo(map.ukMap);



          } catch(e) {
            console.log("ERROR")
            console.log(e)
          }

        },1000);
      });
    }

    return h('div.map',
      h('div#ukMap', '')
    );
  }
}

selectConstituency = Map.selectConstituency;
deselectConstituency = Map.deselectConstituency;
findConstituency = Map.findConstituency;

module.exports = Map;
