//Services
const hyperdom = require('hyperdom');
const h = hyperdom.html;
const router = require('hyperdom-router');
const model = require('../models/model');
Model = model;


//Components
const Search = require('./search');
const ClickMap = require('./map');
const Card = require('./card');

class App {
  constructor() {
    router.start({history: router.hash});
  }

  render() {

    var partySeats = [
      {
        name: "Conservatives",
        seats: 326
      },
      {
        name: "Labour",
        seats: 230
      },
      {
        name: "Scottish National Party",
        seats: 56
      }
    ];

    var summary = 'No. of Results: ' + model.data.summary.resultsDeclared + '\n'
                + 'Total Votes: ' + model.data.summary.totalVotesCounted + '\n'
                + 'Forecast Winner: ' + model.data.summary.forecastWinner + '\n'
                + 'Forecast Majority: ' + model.data.summary.forecastMajority;

    const selectConstituency = function(key) {
      return implementSelectConstituency(key)
    }

    const searchBar = new Search(selectConstituency);
    const ukMap = new ClickMap(selectConstituency);
    // const seatsCard = new Card({ name: "Seats at a Glance", parties: partySeats, type: "votes" });
    const summaryCard = new Card({ name: "Voting Summary", description: summary, type: "Detail" });
    // const latestCard = new Card({ name: "Latest Results", description: "Conservatives, Labour, Lib Dems", type: "Organization" });
    // const tableCard = new Card({ name: "State of the Parties: Which Party is Winning", type: "table", "parties": model.data.detailsByParty });



    const implementSelectConstituency = function(key) {
      ukMap.selectConstituency(key);
      seatsCard.selectConstituency(key);
    }

    var returnable = h('div.app',
      ukMap,
      h('div.side-cards',
        // seatsCard,
        summaryCard,
        // latestCard
      )
      // tableCard
    );
    return returnable;


    // return h('div',
    //   routes.home(function() {
    //     return this.renderHome();
    //   }),
    //   routes.contacts(function() {
    //     return this.renderContacts();
    //   }),
    //
    // )
  }
}

module.exports = App;
