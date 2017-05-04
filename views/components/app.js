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
      return (seats/5 + '%');
    }

    var partySeats = [
      {
        name: "Conservatives",
        seats: 326,
        color: "blue",
        getWidth: getSeatsWidth
      },
      {
        name: "Labour",
        seats: 230,
        color: "red",
        getWidth: getSeatsWidth
      },
      {
        name: "Scottish National Party",
        seats: 56,
        color: "yellow",
        getWidth: getSeatsWidth
      }
    ];


    var summary = [
      {
        cells: [
          { value: 'No. of Results:' },
          { value: model.data.summary.resultsDeclared }
        ]
      },
      {
        cells: [
          { value: 'Total Votes:' },
          { value: model.data.summary.totalVotesCounted }
        ]
      },
      {
        cells: [
          { value: 'Forecast Winner:' },
          { value: model.data.summary.forecastWinner }
        ]
      },
      {
        cells: [
          { value: 'Forecast Majority:' },
          { value: model.data.summary.forecastMajority }
        ]
      }
    ];

    var latest = [
      {
        value: "Conservatives take Vauxhall"
      },
      {
        value: "Lib Dems take Vauxhall"
      },
      {
        value: "Conservatives take Vauxhall"
      },
      {
        value: "Conservatives take Vauxhall"
      }
    ]

    const selectConstituency = function(constituency) {
      return implementSelectConstituency(constituency)
    }

    const searchBar = new Search(selectConstituency);
    const ukMap = new ClickMap(selectConstituency);
    const seatsCard = new Card({ name: "Seats at a Glance", parties: partySeats, getWidth: getSeatsWidth, type: "votes" });
    const summaryCard = new Card({ name: "Voting Summary", rows: summary, type: "stats" });
    const latestCard = new Card({ name: "Latest Results", description: "Conservatives, Labour, Lib Dems", type: "Organization" });
    // const tableCard = new Card({ name: "State of the Parties: Which Party is Winning", type: "table", "parties": model.data.detailsByParty });



    const implementSelectConstituency = function(constituency) {
      ukMap.selectConstituency(constituency.objectID);
      var newData = {
        parties: constituency.ge2015Results
      }
      newData.parties.map(function(party) {
        party.seats = party.share
        return party
      })
      seatsCard.updateData(newData);
      setTimeout(function(){
        // seatsCard.refresh();
      },1000);
    }

    var returnable = h('div.app',
      ukMap,
      h('div.side-cards',
        seatsCard,
        summaryCard,
        latestCard
      )
      // tableCard
    );
    return returnable;
  }
}

module.exports = App;
