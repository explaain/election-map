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

  }

  render() {

    var getSeatsWidth = function(seats) {
      return (seats/4.5 + '%');
    }


    // model.data.detailsByParty = testData.detailsByParty;
    // model.data.summary = testData.summary;



    var summaryRows = [
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

    var latestItems = [
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


    var tableKeysToHeadings = {
      // abbreviation: "Abbreviation",
      name: "Party",
      // objectID: "objectID",
      // paId: "paId",
      totalVotes: "Votes",
      percentageChange: "% Change",
      percentageShare: "% Share",
    }

    function partiesToTable() {
      var parties = model.data.detailsByParty;
      var rows = parties.map(function(party) {
        var partyKeys = Object.keys(party);
        var newParty = [];
        var keys = Object.keys(tableKeysToHeadings);
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
      var headerKeys = Object.keys(tableKeysToHeadings);
      var headerRow = headerKeys.map(function(headerKey) {
        return { value: tableKeysToHeadings[headerKey] };
      })
      rows.unshift({ cells: headerRow })
      console.log('rows');
      console.log(rows);
      return rows;
    }

    const getConstituencyData = function(key) {

      return model.data.constituencies.filter(function(constituency) {
        return constituency.objectID == key;
      })[0];
    }

    const selectConstituency = function(constituency) {
      console.log(constituency);
      if (typeof constituency === 'string') {
        constituency = getConstituencyData(constituency);
      }
      console.log(constituency.objectID);
      return implementSelectConstituency(constituency)
    }

    model.seatsCard = { name: "Seats at a Glance", getWidth: getSeatsWidth, type: "votes" }

    model.seatsCard.parties = [
      {
        name: "Conservatives",
        seats: 326,
        color: "#204eb7",
        getWidth: getSeatsWidth
      },
      {
        name: "Labour",
        seats: 230,
        color: "#e43b2c",
        getWidth: getSeatsWidth
      },
      {
        name: "Scottish National Party",
        seats: 56,
        color: "#f3df00",
        getWidth: getSeatsWidth
      },
      {
        name: "Liberal Democrats",
        seats: 8,
        color: "#e0aa15",
        getWidth: getSeatsWidth
      }
    ];

    // function get

    const searchBar = new Search(selectConstituency);
    const ukMap = new ClickMap(selectConstituency);
    const seatsCard = new Card('seatsCard');
    const summaryCard = new Card({ name: "Voting Summary", icon: "fa-bar-chart", rows: summaryRows, type: "stats" });
    const latestCard = new Card({ name: "Latest Results", items: latestItems, type: "list" });
    const tableCard = new Card({ name: "State of the Parties: Which Party is Winning", type: "table", rows: partiesToTable() });



    const implementSelectConstituency = function(constituency) {
      console.log(constituency.objectID);
      ukMap.selectConstituency(constituency.objectID);
      var newData = {
        parties: constituency.ge2015Results
      }
      newData.parties.map(function(party) {
        party.seats = party.share;
        party.name = party.party;
        party.getWidth = getSeatsWidth
        return party
      })

      model.seatsCard.parties = newData.parties;

      setTimeout(function() {
        summaryCard.updateData({rows: [{cells: [{value:"1"}]}]});
        setTimeout(function() {
          summaryCard.refresh();
        },1000)
      },1000)
    }

    var returnable = h('div.app',
      ukMap,
      h('div.side-cards',
        seatsCard,
        summaryCard,
        latestCard
      ),
      tableCard
    );

    // model.data.summary.resultsDeclared = 3;
    // summaryCard.refresh();
    return returnable;
  }
}

module.exports = App;
