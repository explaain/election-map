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


    model.data.detailsByParty = testData.detailsByParty;
    model.data.summary = testData.summary;

    model.data.summary = PaData.Ge2017_SOP.$;

    console.log(PaData.Ge2017_SOP.$)


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
    ]

    function partiesToTable() {
      var parties = model.data.detailsByParty;
      var rows = parties.map(function(party) {
        party.partyResults = party.partyResults.map(function(result) {
          result.value = result.value.toString();
          return result;
        })
        return {cells: party.partyResults}
      })
      var headerRow = parties[0].partyResults.map(function(data) {
        return { value: data.name };
      })
      rows.unshift({ cells: headerRow })
      return rows;
    }

    const getConstituencyData = function(key) {
      //Algolia stuff here!
      //for now - return example:
      return {"ge2015Results":[{"party":"labour-and-cooperative-party","rank":1,"votes":18447,"voteMargin":6686,"share":45,"shareMargin":16.3,"shareChange":5.4},{"party":"conservative","rank":2,"votes":11761,"voteMargin":-6686,"share":28.7,"shareMargin":-16.3,"shareChange":-4.2},{"party":"ukip","rank":3,"votes":7720,"voteMargin":null,"share":18.8,"shareMargin":null,"shareChange":15.5},{"party":"green","rank":4,"votes":1850,"voteMargin":null,"share":4.5,"shareMargin":null,"shareChange":2.9},{"party":"lib-dem","rank":5,"votes":1256,"voteMargin":null,"share":3.1,"shareMargin":null,"shareChange":-14}],"name":"Stoke-on-Trent Central","objectID":"E14000967","_highlightResult":{"ge2015Results":[{"party":{"value":"labour-<em>a</em>nd-cooperative-party","matchLevel":"full","fullyHighlighted":false,"matchedWords":["a"]}},{"party":{"value":"conservative","matchLevel":"none","matchedWords":[]}},{"party":{"value":"ukip","matchLevel":"none","matchedWords":[]}},{"party":{"value":"green","matchLevel":"none","matchedWords":[]}},{"party":{"value":"lib-dem","matchLevel":"none","matchedWords":[]}}],"name":{"value":"Stoke-on-Trent Central","matchLevel":"none","matchedWords":[]}}}
    }

    const selectConstituency = function(constituency) {
      if (typeof constituency === 'string') {
        constituency = getConstituencyData(constituency);
      }
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

    const searchBar = new Search(selectConstituency);
    const ukMap = new ClickMap(selectConstituency);
    const seatsCard = new Card('seatsCard');
    const summaryCard = new Card({ name: "Voting Summary", icon: "fa-bar-chart", rows: summaryRows, type: "stats" });
    const latestCard = new Card({ name: "Latest Results", items: latestItems, type: "list" });
    const tableCard = new Card({ name: "State of the Parties: Which Party is Winning", type: "table", rows: partiesToTable() });



    const implementSelectConstituency = function(constituency) {
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
