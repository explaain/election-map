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

function CommaFormatted(_number) {
  if (typeof _number != "string") { _number = _number.toString() }
  const _sep = ",";
  _number = typeof _number != "undefined" && _number > 0 ? _number : "";
  _number = _number.replace(new RegExp("^(\\d{" + (_number.length%3? _number.length%3:0) + "})(\\d{3})", "g"), "$1 $2").replace(/(\d{3})+?/gi, "$1 ").trim();
  if(typeof _sep != "undefined" && _sep != " ") {
      _number = _number.replace(/\s/g, _sep);
  }
  return _number;
}

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
        if ('parentIFrame' in window) {
          var scroll = true;
          var infoCallback = function(info) {
            if (scroll) {
              parentIFrame.sendMessage({type: 'scroll', pos: info.offsetTop});
            }
            scroll = false;
          }
          parentIFrame.getPageInfo(infoCallback)
        } else {
          $('html, body').animate({
            scrollTop: 0
          }, 500);
        }
        self.ukMap.deselectConstituency();
        model.selectedConstituencyLayer = null;
        model.selectedConstituency = null;
        self.refresh();
      })
    }

    model.constituenciesData = [];
    //@TODO - HOTFIX - should be actually model.partySummary = {}
    model.partySummary = {
      "numberOfResults":"",
      "totalNumberOfConstituencies":"",
      "totalVotes":"",
      "forecastWinningParty":""
    };
    model.partiesData = {
      results: []
    };
    model.latestData = [];
    model.seatsCard = { name: (SWITCH ? "" : "2015: ") + "Seats at a Glance", getWidth: self.getSeatsWidth, type: "votes", parties: [], partiesExist: true}
    const client = algoliasearch(conf.algoliaId, conf.algoliaPublic)
    async.parallel([
      function(cb){
        if(SWITCH){
          console.log(1);
          const index = client.initIndex("map-constituencies-"+(conf.paFetchMode==="LIVE"?"live":"test"));
          index.search('', {
            hitsPerPage: 650 //TODO: looks like a hardcode
          }, function searchDone(err, content) {
            model.constituenciesData = require("../../public/data/constituencies2017-empty");
            console.log("CH4")
            if(content){
              const freshData = content.hits;
              self.totalResultsAmount = freshData.length;
              freshData.forEach(function(constituency){
                model.constituenciesData.filter(function(_constituency) {
                  return _constituency.objectID === constituency.objectID;
                })[0].results = constituency.results;
              })
            }
            cb();
          });
        } else {
          console.log(2);
          model.constituenciesData = require("../../public/data/constituencies2015");
          model.byElections = require("../../public/data/byElections");
          model.constituenciesData.forEach(function(_constituency){
            _constituency.results.forEach(function(_party){
              const partyFound = allParties.filter(function(__party) {
                return __party.key == _party.party;
              })[0];
              _party.name = partyFound?partyFound.name:"";
            })
            const byElection = model.byElections.filter(function(byElection) {
              return byElection.constituency == _constituency.objectID;
            })[0];
            if (byElection) {
              console.log('byElection')
              console.log('byElection')
              _constituency.newParty = byElection.newParty;
            }
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
            console.log("CH1")
            if(content){
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
            }
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
            console.log("CH2")
            if(content){
              model.partySummary = content.hits[0];
              model.partySummaryReallyLoaded = true;
            }
            model.partySummaryLoaded = true;
            cb();
          });
        } else {
          model.partySummary = require("../../public/data/partySummary2015");
          model.partySummaryLoaded = true;
          model.partySummaryReallyLoaded = true;
          cb();
        }
      },
      function(cb){
        if(SWITCH){
          const index = client.initIndex("map-latest-"+(conf.paFetchMode==="LIVE"?"live":"test"));
          index.search('', {}, function searchDone(err, content) {
            console.log("CH3")
            if(content){
              model.latestData = content.hits;
              model.latestDataLoaded = true;
            }
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
      model.seatsCard.partiesExist = model.seatsCard.parties.length > 0;
      model.seatsCard.parties.sort(function(a,b){
        return b.seats - a.seats;
      })

      self.refresh();
    })

    self.getSeatsWidth = function(seats) {
      return (seats/4.5 + '%');
    }










    self.partiesToTable = function(parties) {
      console.log('parties');
      console.log(parties);
      console.log(parties.length);
      if(parties.length === 0){
        console.log('hi');
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
      console.log(constituency);
      mixpanel.track("Selected constituency", {constituency: constituency});
      if (typeof constituency === 'string') {
        constituency = self.getConstituencyData(constituency);
      }
      return self.implementSelectConstituency(constituency)

    }

    self.implementSelectConstituency = function(constituency) {
      self.ukMap.selectConstituency(constituency.objectID);
      console.log(constituency.objectID);
      model.selectedConstituency = self.getConstituencyData(constituency.objectID);
      console.log('self.getConstituencyData');
      console.log(self.getConstituencyData);
      console.log(constituency);
      setTimeout(function(){
        if ('parentIFrame' in window) {
          var scroll = true;
          var infoCallback = function(info) {
            if (scroll) {
              parentIFrame.sendMessage({type: 'scroll', pos: info.offsetTop + $(".card.table").offset().top - 20});
            }
            scroll = false;
          }
          parentIFrame.getPageInfo(infoCallback)
        } else {
          $('html, body').animate({
            scrollTop: $(".card.table").offset().top - 20
          }, 500);
        }
      },500)
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
      if(SWITCH) {
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
          votes: "Votes",
          shareChange: "% Change",
          share: "% Share",
        }
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
    if(model.partySummaryReallyLoaded){
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
            { value: CommaFormatted(model.partySummary.totalVotes) }
          ]
        },
        {
          cells: [
            { value: (SWITCH?'Forecast Winner:':'Winner:') },
            { value: model.partySummary.forecastWinningParty ? model.partySummary.forecastWinningParty : "TBC" }
          ]
        },
        // {
        //   cells: [
        //     { value: 'Forecast Majority:' },
        //     { value: model.data.summary.forecastMajority }
        //   ]
        // }
      ];
    } else {
      self.summaryRows = []
    }


    var summaryTitle = SWITCH ? 'Voting Summary' : '2015 Voting Summary';


    console.log('model.selectedConstituency');
    console.log(model.selectedConstituency);
    // console.log(model.selectedConstituency.objectID);


    var showCandidates = !SWITCH && model.selectedConstituency !== undefined && model.selectedConstituency !== null;

    console.log('showCandidates')
    console.log(showCandidates)

    var localCandidates = showCandidates ?
      allCandidates.filter(function(candidate){
        return candidate.gss_code === model.selectedConstituency.objectID
      }).map(function(candidate) { candidate.image_url = candidate.image_url || '/img/profile.png'; return candidate })
      : [];

    console.log('localCandidates')
    console.log(localCandidates)

    var clientCards = [];

    console.log('localCandidates');
    console.log(localCandidates);

    localCandidates.forEach(function(localCandidate){
      clientCards.push({
        "@id": "//api.explaain.com/Headline/localCandidate_"+localCandidate.id,
        "@type": "http://api.explaain.com/Headline",
        image: localCandidate.image_url,
        name: localCandidate.name,
        description: (new LocalCandidateDetails(localCandidate)).render()
      });
      localCandidate.cardHref = "//api.explaain.com/Headline/localCandidate_"+localCandidate.id;
      localCandidate.openCandidate = function(e) {
        e.preventDefault();
        if ('parentIFrame' in window) {
          parentIFrame.sendMessage({type: 'openCard', key: localCandidate.cardHref});
        } else {
          explaain.showOverlay(localCandidate.cardHref);
        }
        return false;
      }
    });
    console.log('clientCards');
    console.log(clientCards);
    if ('parentIFrame' in window) {
      parentIFrame.sendMessage({type: 'addCards', data: clientCards});
    } else {
      explaain.addClientCards(clientCards);
    }

    // mixpanel.track_links(".local-candidate-plate","Opened Candidate Card");

    var mainName = model.selectedConstituency ? "Your candidates for " + model.selectedConstituency.name : "";
    var tableName = model.selectedConstituency ? (SWITCH ? '2017' : '2015') + " Results for " + model.selectedConstituency.name : (SWITCH ? "State of the Parties: Which Party is Winning" : "2015 Results Breakdown");

    const tableCardRows = self.partiesToTable(model.selectedConstituency?model.selectedConstituency.results:model.partiesData.results);
    model.cardsData = {
      'seatsCard': "seatsCard",
      'summaryCard': { id: "summaryCard", name: (SWITCH ? "Voting Summary" : "2015: Results Summary"), icon: "fa-bar-chart", rows: self.summaryRows, type: "stats", rowsExist: self.summaryRows.length>0 || !model.partySummaryLoaded },
      'latestCard': { id: "latestCard", name: "Latest Results", items: self.latestItems, type: "list", itemsExist: self.latestItems.length > 0 || !model.latestDataLoaded },
      'tableCard': { id: "tableCard", name: mainName, showCandidates: showCandidates, selectedConstituency: model.selectedConstituency, localCandidates: localCandidates, tableName: tableName, type: "table", rows: tableCardRows, rowsExist: tableCardRows.length>1, deselectConstituency: self.deselectConstituency, selectedConstituency: model.selectedConstituency }
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


    $('.card.table .body-content').on('scroll', function() {
      console.log('hi');
      if($(this).scrollLeft() > 80) {
        console.log('hi1');
        $('.card.table .body-content .fade-mask').fadeOut(1000);
      }
    });

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
