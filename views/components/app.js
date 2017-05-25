//Services
const hyperdom = require('hyperdom');
const h = hyperdom.html;
const model = require('../models/model');
const async = require('async');
Model = model;
const SWITCH = new Date(conf.startDate)<new Date();


//Components
const Search = require('./search');
const ClickMap = require('./map');
const Card = require('./card');

class App {
  constructor() {
    const self = this;


    var getParty = function(key) {
      var party = allParties.filter(function(party) {
        return party.key == key;
      })[0];
      if (!party) {
        party = {key: key, name: key, color: 'lightgray'}
      }
      return party;
    }

    // Getting data
    model.constituenciesData = [];
    model.partiesData = {
      results: []
    };
    model.seatsCard = { name: "Seats at a Glance", getWidth: self.getSeatsWidth, type: "votes", parties: []}
    const client = algoliasearch(conf.algoliaId, conf.algoliaPublic)
    async.parallel([
      function(cb){
        if(SWITCH){
          const index = client.initIndex("map-constituencies-"+(conf.paFetchMode==="LIVE"?"live":"test"));
          index.search('', {
            hitsPerPage: 650 //TODO: looks like a hardcode
          }, function searchDone(err, content) {
            model.constituenciesData = content.hits;

            cb();
          });
        } else {
          model.constituenciesData = require("../../public/data/constituencies2015");
          model.constituenciesData.forEach(function(_constitiency){
            _constitiency.results.forEach(function(_party){
              const partyFound = allParties.filter(function(__party) {
                return __party.key == _party.party;
              })[0];
              _party.name = partyFound?partyFound.name:"";
            })
          })
          cb();
        }
      },
      function(cb){
        if(SWITCH){
          const index = client.initIndex("map-parties-"+(conf.paFetchMode==="LIVE"?"live":"test"));
          index.search('', {
            hitsPerPage: 650 //TODO: looks like a hardcode
          }, function searchDone(err, content) {
            content.hits.forEach(function(party){
              const partyCode = party.name.toLowerCase().replace(/\s/g,"-");
              model.partiesData.results.push({
                party: partyCode,
                //rank: parties.length+1,
                votes: party.totalVotes,
                name: party.name,
                seats: party.totalSeats?party.totalSeats:0,
                share: party.percentageShare,
                shareChange: party.percentageChange,
              });
              model.partiesData.results.sort(function(a,b){
                return b.share - a.share;
              })


            });
            console.log(model.partiesData)
            cb();
          });
        } else {
          model.partiesData.results = require("../../public/data/parties2015");
          console.log(model.partiesData)
          setTimeout(function(){
            cb();
          })
        }
      }
    ],function(){
      model.constituenciesData.totalVotes = 0;
      model.partiesData.results.forEach(function(_data){
        model.constituenciesData.totalVotes+=parseInt(_data.votes);
      });
      model.partiesData.results.forEach(function(party){
        const partyCode = party.name.toLowerCase().replace(/\s/g,"-");
        model.seatsCard.parties.push({
          name: party.name,
          seats: party.seats,
          color: getParty(partyCode).color,//"#e43b2c",
          getWidth: self.getSeatsWidth,
          code: partyCode,
        });
      })
      model.seatsCard.parties.sort(function(a,b){
        return b.seats - a.seats;
      })

      self.refresh();
    })

    // END: getting data

    self.getSeatsWidth = function(seats) {
      return (seats/4.5 + '%');
    }


    // model.data.detailsByParty = testData.detailsByParty;
    // model.data.summary = testData.summary;





    self.latestItems = [
      {
        value: "Conservatives hold Westminster"
      },
      {
        value: "Lib Dems take Vauxhall"
      },
      {
        value: "Conservatives take Lambeth"
      },
      {
        value: "Labour hold Islington North"
      }
    ];


    self.tableKeysToHeadings = {
      // abbreviation: "Abbreviation",
      name: "Party",
      // objectID: "objectID",
      // paId: "paId",
      votes: "Votes",
      shareChange: "% Change",
      share: "% Share",
    }

    self.partiesToTable = function(parties) {
      if(!parties){
        return [];
      }
      var rows = parties.map(function(party) {
        var partyKeys = Object.keys(party);
        var newParty = [];
        var keys = Object.keys(self.tableKeysToHeadings);
        keys.forEach(function(key) {
          newParty.push({
            name: key,
            value: party[key]
          })
        })
        newParty = newParty.map(function(result) {
          if (result.value) {result.value = result.value.toString();}
          return result;
        })
        return {cells: newParty}
      })
      //THE HEADER ROW STUFF NEEDS SORTING
      var headerKeys = Object.keys(self.tableKeysToHeadings);
      var headerRow = headerKeys.map(function(headerKey) {
        return { value: self.tableKeysToHeadings[headerKey] };
      })
      rows.unshift({ cells: headerRow })
      return rows;
    }


    self.getConstituencyData = function(key) {
      return model.constituenciesData.filter(function(constituency) {
        return constituency.objectID == key;
      })[0];
    }

    self.selectConstituency = function(constituency) {
      if (typeof constituency === 'string') {
        constituency = self.getConstituencyData(constituency);
      }
      return self.implementSelectConstituency(constituency)
    }

    var getParty = function(key) {
      var party = allParties.filter(function(party) {
        return party.key == key;
      })[0];
      if (!party) {
        party = {key: key, name: key, color: 'lightgray'}
      }
      if (!party.key) {party.key = key}
      if (!party.name) {party.name = party.key}
      if (!party.color) {party.color = 'lightgray'}
      return party;
    }

    self.implementSelectConstituency = function(constituency) {
      self.ukMap.selectConstituency(constituency.objectID);
      /*var newData = {
        parties: constituency.results
      }
      newData.parties = newData.parties.map(function(party) {
        var newParty = getParty(party.party);
        newParty.seats = party.seats || party.share;
        newParty.getWidth = self.getSeatsWidth
        return newParty
      })
      model.seatsCard.parties = newData.parties;
      self.seatsCard.refresh();*/
      model.selectedConstituency = self.getConstituencyData(constituency.objectID);
      self.refresh()
    }




    /*model.seatsCard.parties = [
      {
        name: "Conservatives",
        seats: 0,//326,
        color: "#204eb7",
        getWidth: self.getSeatsWidth,
        code: "conservative"
      },
      {
        name: "Labour",
        seats: 0,//230,
        color: "#e43b2c",
        getWidth: self.getSeatsWidth,
        code: "labour"
      },
      {
        name: "Scottish National Party",
        seats: 0,//56,
        color: "#f3df00",
        getWidth: self.getSeatsWidth,
        code: "plaid"
      },
      {
        name: "Liberal Democrats",
        seats: 0,//8,
        color: "#e0aa15",
        getWidth: self.getSeatsWidth,
        code: "lib-dem"
      }
    ];*/








    self.searchBar = new Search(self.selectConstituency);
    self.ukMap = new ClickMap(self.selectConstituency);

  }

  render() {
    const self = this;
    self.summaryRows = [
      {
        cells: [
          { value: 'No. of Results:' },
          { value: model.data.summary.numberOfResults + ' / ' + model.data.summary.totalNumberOfConstituencies  }
        ]
      },
      {
        cells: [
          { value: 'Total Votes:' },
          { value: model.constituenciesData.totalVotes }
        ]
      },
      {
        cells: [
          { value: 'Forecast Winner:' },
          { value: model.data.summary.forecastWinningParty }
        ]
      },
      // {
      //   cells: [
      //     { value: 'Forecast Majority:' },
      //     { value: model.data.summary.forecastMajority }
      //   ]
      // }
    ];
    model.cardsData = {
      'seatsCard': "seatsCard",
      'summaryCard': { id: "summaryCard", name: "Voting Summary", icon: "fa-bar-chart", rows: self.summaryRows, type: "stats" },
      'latestCard': { id: "latestCard", name: "Latest Results", items: self.latestItems, type: "list" },
      'tableCard': { id: "tableCard", name: "State of the Parties: Which Party is Winning", type: "table", rows: self.partiesToTable(model.selectedConstituency?model.selectedConstituency.results:model.partiesData.results) }
    }
    self.seatsCard = new Card(model.cardsData["seatsCard"]);
    self.summaryCard = new Card(model.cardsData["summaryCard"]);
    self.latestCard = new Card(model.cardsData["latestCard"]);
    self.tableCard = new Card(model.cardsData["tableCard"]);
    var returnable = h('div.app',
      self.ukMap,
      h('div.side-cards',
        self.seatsCard,
        self.summaryCard,
        self.latestCard
      ),
      self.tableCard
    );

    return returnable;
  }
}

module.exports = App;
