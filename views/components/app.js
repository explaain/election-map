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

const allCandidates = require("../../public/data/localCandidates");

class App {
  constructor() {
    const self = this;

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

    self.deselectConstituency = function(){

      setTimeout(function(){
        $('html, body').animate({
          scrollTop: 0
        }, 500);
        self.ukMap.deselectConstituency();
        model.selectedConstituencyLayer = null;
        model.selectedConstituency = null;
        self.refresh();
      })
    }

    model.constituenciesData = [];
    model.partySummary = {};
    model.partiesData = {
      results: []
    };
    model.latestData = [];
    model.seatsCard = { name: "Seats at a Glance", getWidth: self.getSeatsWidth, type: "votes", parties: []}
    const client = algoliasearch(conf.algoliaId, conf.algoliaPublic)
    async.parallel([
      function(cb){
        if(SWITCH){
          const index = client.initIndex("map-constituencies-"+(conf.paFetchMode==="LIVE"?"live":"test"));
          index.search('', {
            hitsPerPage: 650 //TODO: looks like a hardcode
          }, function searchDone(err, content) {
            model.constituenciesData = require("../../public/data/constituencies2017-empty");
            const freshData = content.hits;
            self.totalResultsAmount = freshData.length;
            freshData.forEach(function(constituency){
              model.constituenciesData.filter(function(_constituency) {
                return _constituency.objectID === constituency.objectID;
              })[0].results = constituency.results;
            })
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
                return b.seats - a.seats;
              })
            });
            cb();
          });
        } else {
          model.partiesData.results = require("../../public/data/parties2015");
          setTimeout(function(){
            cb();
          })
        }
      },
      function(cb){
        if(SWITCH){
          const index = client.initIndex("map-pa-"+(conf.paFetchMode==="LIVE"?"live":"test"));
          index.search('', {}, function searchDone(err, content) {
            model.partySummary = content.hits[0];
            cb();
          });
        } else {
          model.partySummary = require("../../public/data/partySummary2015");
          cb();
        }
      },
      function(cb){
        if(SWITCH){
          const index = client.initIndex("map-latest-"+(conf.paFetchMode==="LIVE"?"live":"test"));
          index.search('', {}, function searchDone(err, content) {
            model.latestData = content.hits;
            cb();
          });
        } else {
          cb();
        }
      },
    ],function(){
      model.constituenciesData.totalVotes = 0;
      model.partiesData.results.forEach(function(_data){
        model.constituenciesData.totalVotes+=parseInt(_data.votes);
      });
      model.partiesData.results.forEach(function(party){
        if(party.seats>0){
          model.seatsCard.parties.push({
            name: party.name,
            seats: party.seats,
            color: getParty(party.party).color,
            getWidth: self.getSeatsWidth,
            code: party.party,
          });
        }

      })
      model.seatsCard.parties.sort(function(a,b){
        return b.seats - a.seats;
      })

      self.refresh();
    })

    self.getSeatsWidth = function(seats) {
      return (seats/4.5 + '%');
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

    self.implementSelectConstituency = function(constituency) {
      self.ukMap.selectConstituency(constituency.objectID);
      model.selectedConstituency = self.getConstituencyData(constituency.objectID);
      self.refresh()
    }

    self.searchBar = new Search(self.selectConstituency);
    self.ukMap = new ClickMap(self.selectConstituency,self.deselectConstituency);
    MyMap = self.ukMap;
  }

  render() {
    const self = this;

    self.latestItems = [];
    model.latestData.forEach(function(latestResult){
      self.latestItems.push({
        value: latestResult.party + " " + latestResult.type + " " + latestResult.constituency,
        action: function(){self.selectConstituency(latestResult.constituencyID)}
      })
    })

    if(model.selectedConstituency){
      self.tableKeysToHeadings = {
        name: "Party",
        candidate: "Candidate",
        votes: "Votes",
        shareChange: "% Change",
        share: "% Share",
      }
    } else {
      self.tableKeysToHeadings = {
        name: "Party",
        seats: "Seats",
        votes: "Votes",
        shareChange: "% Change",
        share: "% Share",
      }
    }

    self.summaryRows = [
      {
        cells: [
          { value: 'No. of Results:' },
          { value: model.partySummary.numberOfResults+ ' / ' + model.partySummary.totalNumberOfConstituencies  }
        ]
      },
      {
        cells: [
          { value: 'Total Votes:' },
          { value: model.partySummary.totalVotes }
        ]
      },
      {
        cells: [
          { value: (SWITCH?'Forecast Winner:':'Winner:') },
          { value: model.partySummary.forecastWinningParty }
        ]
      },
      // {
      //   cells: [
      //     { value: 'Forecast Majority:' },
      //     { value: model.data.summary.forecastMajority }
      //   ]
      // }
    ];

    const localCandidates = model.selectedConstituency ?
      allCandidates.filter(function(candidate){
        return candidate.gss_code === model.selectedConstituency.objectID
      }).map(function(candidate) { candidate.image_url = candidate.image_url || '/img/profile.png'; return candidate })
      : [];

    var clientCards = [];

    localCandidates.forEach(function(localCandidate){
      clientCards.push({
        "@id": "//api.explaain.com/Headline/localCandidate_"+localCandidate.id,
        "@type": "http://api.explaain.com/Headline",
        image: localCandidate.image_url,
        name: localCandidate.name,
        description: (new LocalCandidateDetails(localCandidate)).render()
      });
      localCandidate.cardHref = "//api.explaain.com/Headline/localCandidate_"+localCandidate.id;
    });
    console.log('clientCards');
    console.log(clientCards);
    // explaain.addClientCards(clientCards);

    // var tableName = (SWITCH ? '2017' : '2015') + " Results for " + model.selectedConstituency.name;

    const tableCardRows = self.partiesToTable(model.selectedConstituency?model.selectedConstituency.results:model.partiesData.results);
    model.cardsData = {
      'seatsCard': "seatsCard",
      'summaryCard': { id: "summaryCard", name: "Voting Summary", icon: "fa-bar-chart", rows: self.summaryRows, type: "stats" },
      'latestCard': { id: "latestCard", name: "Latest Results", items: self.latestItems, type: "list" },
      'tableCard': { id: "tableCard", name: "State of the Parties: Which Party is Winning", localCandidates: localCandidates, tableName: tableName, type: "table", rows: tableCardRows, rowsExist: tableCardRows.length>1, deselectConstituency: self.deselectConstituency, selectedConstituency: model.selectedConstituency }
    }
    self.seatsCard = new Card(model.cardsData["seatsCard"]);
    self.summaryCard = new Card(model.cardsData["summaryCard"]);
    self.latestCard = new Card(model.cardsData["latestCard"]);
    self.tableCard = new Card(model.cardsData["tableCard"]);
    console.log("model.selectedConstituency")
    console.log(model.selectedConstituency)
    const constituencyDeselector = helpers.assembleCards({deselectConstituency: self.deselectConstituency, selectedConstituency: model.selectedConstituency}, 'constituencyDeselector');
    var returnable = h('div.app',
      self.ukMap,
      h('div.side-cards',
        self.seatsCard,
        self.summaryCard,
        (SWITCH?self.latestCard:undefined)
      ),
      self.tableCard,
      constituencyDeselector
    );

    return returnable;
  }
}

class LocalCandidateDetails {
  constructor(data) {
    const self = this;
    self.data = data;
  }

  render() {
    var self = this;
    return  "<div class='local-candidate-details'>" +
              "<div>" + self.data.party_name + "</div>" +
              "<div>" + self.data.birth_date + "</div>" +
              "<div>" + self.data.post_label + "</div>" +
              (self.data.email ? "<div><a href='mailto:" + self.data.email + "'>" + self.data.email + "</a></div>" : "") +
              (self.data.twitter_username ? "<div><a href='https://twitter.com/" + self.data.twitter_username + "'>@" + self.data.twitter_username + "</a></div>" : "") +
              (self.data.facebook_page_url ? "<div><a href='" + self.data.facebook_page_url + "'>Facebook</a></div>" : "") +
              (self.data.homepage_url ? "<div><a href='" + self.data.homepage_url + "'>Homepage</a></div>" : "") +
              (self.data.wikipedia_url ? "<div><a href='" + self.data.wikipedia_url + "'>Wikipedia</a></div>" : "") +
              (self.data.likedin_url ? "<div><a href='" + self.data.likedin_url + "'>LinkedIn</a></div>" : "") +
              // (self.data.mapit_url ? "<div><a href='" + self.data.mapit_url + "'>MapIt</a></div>" : "") +
            "</div>";
  }
}

module.exports = App;
