//Services
const hyperdom = require('hyperdom');
const h = hyperdom.html;
const model = require('../models/model');
Model = model;


//Components
const Search = require('./search');
const ClickMap = require('./map');
const Card = require('./card');

class App {
  constructor() {
    const self = this;

    self.getSeatsWidth = function(seats) {
      return (seats/4.5 + '%');
    }
    self.getShareWidth = function(seats) {
      return (seats/0.85) + '%';
    }


    // model.data.detailsByParty = testData.detailsByParty;
    // model.data.summary = testData.summary;



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
          { value: model.data.summary.totalVotes }
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
      totalVotes: "Votes",
      percentageChange: "% Change",
      percentageShare: "% Share",
    }

    self.partiesToTable = function() {
      var parties = model.data.detailsByParty;
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
        console.log(newParty);
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
      console.log('rows');
      console.log(rows);
      return rows;
    }


    self.getConstituencyData = function(key) {

      return model.data.constituencies.filter(function(constituency) {
        return constituency.objectID == key;
      })[0];
    }

    self.selectConstituency = function(constituency) {
      console.log(constituency);
      if (typeof constituency === 'string') {
        constituency = self.getConstituencyData(constituency);
      }
      return self.implementSelectConstituency(constituency)
    }

    var getParty = function(key) {
      console.log(key);
      var party = allParties.filter(function(party) {
        return party.key == key;
      })[0];
      console.log(party);
      if (!party) {
        party = {key: key, name: key.replace(/-/g, ' '), color: 'lightgray'}
      }
      if (!party.key) {party.key = key}
      if (!party.name) {party.name = party.key.replace(/-/g, ' ')}
      if (!party.color) {party.color = 'lightgray'}
      if (party.name == "no description") {
        party.name = "Other"
      }
      return party;
    }

    self.implementSelectConstituency = function(constituency) {
      self.ukMap.selectConstituency(constituency.objectID);
      var newData = {
        parties: constituency.ge2015Results
      }
      newData.name = constituency.name + " - Results";
      newData.parties = newData.parties.map(function(party) {
        console.log('party');
        console.log(party);
        var newParty = getParty(party.party);
        console.log(party);
        newParty.seats = party.seats || party.share;
        // party.name = party.party;
        newParty.getWidth = self.getShareWidth
        console.log('self.getShareWidth');
        console.log(self.getShareWidth);
        console.log(newParty);
        return newParty
      })

      console.log('newData.parties');
      console.log(newData.parties);


      model.seatsCard.name = newData.name;
      model.seatsCard.parties = newData.parties;
      self.seatsCard.refresh();
      // self.summaryCard.updateData({rows: [{cells: [{value:"1"}]}]});
      // todo: change this to something real
    }


    model.seatsCard = { name: "Seats at a Glance", getWidth: self.getSeatsWidth, type: "votes" }

    model.seatsCard.parties = [
      {
        name: "Conservatives",
        seats: 326,
        color: "#204eb7",
        getWidth: self.getSeatsWidth
      },
      {
        name: "Labour",
        seats: 230,
        color: "#e43b2c",
        getWidth: self.getSeatsWidth
      },
      {
        name: "Scottish National Party",
        seats: 56,
        color: "#f3df00",
        getWidth: self.getSeatsWidth
      },
      {
        name: "Liberal Democrats",
        seats: 8,
        color: "#e0aa15",
        getWidth: self.getSeatsWidth
      }
    ];


    model.cardsData = {
      'seatsCard': "seatsCard",
      'summaryCard': { id: "summaryCard", name: "Voting Summary", icon: "fa-bar-chart", rows: self.summaryRows, type: "stats" },
      'latestCard': { id: "latestCard", name: "Latest Results", items: self.latestItems, type: "list" },
      'tableCard': { id: "tableCard", name: "State of the Parties: Which Party is Winning", type: "table", rows: self.partiesToTable() }
    }

    self.searchBar = new Search(self.selectConstituency);
    self.ukMap = new ClickMap(self.selectConstituency);
    self.seatsCard = new Card(model.cardsData["seatsCard"]);
    self.summaryCard = new Card(model.cardsData["summaryCard"]);
    self.latestCard = new Card(model.cardsData["latestCard"]);
    self.tableCard = new Card(model.cardsData["tableCard"]);
  }

  render() {

    const self = this;

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
