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


    model.data.detailsByParty = testData.detailsByParty;
    model.data.summary = testData.summary;

    model.data.summary = AlgoliaData.summary;; //This should come from Algolia instead
    model.data.detailsByParty = AlgoliaData.parties;



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
        var partyKeys = Object.keys(party);
        var newParty = [];
        partyKeys.forEach(function(partyKey) {
          newParty.push({
            name: partyKey,
            value: party[partyKey]
          })
        })
        newParty = newParty.map(function(result) {
          result.value = result.value.toString();
          return result;
        })
        return {cells: newParty}
      })
      //THE HEADER ROW STUFF NEEDS SORTING
      // var headerRow = partyKeys.map(function(partyKey) {
      //   return { value: partyKey };
      // })
      // rows.unshift({ cells: headerRow })
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


    model.cardsData = {
      'seatsCard': { id: "seatsCard" },
      'summaryCard': { id: "summaryCard", name: "Voting Summary", icon: "fa-bar-chart", rows: summaryRows, type: "stats" },
      'latestCard': { id: "latestCard", name: "Latest Results", items: latestItems, type: "list" },
      'tableCard': { id: "tableCard", name: "State of the Parties: Which Party is Winning", type: "table", rows: partiesToTable() }
    }

    const searchBar = new Search(selectConstituency);
    const ukMap = new ClickMap(selectConstituency);
    const seatsCard = new Card(model.cardsData["seatsCard"]);
    const summaryCard = new Card(model.cardsData["summaryCard"]);
    const latestCard = new Card(model.cardsData["latestCard"]);
    const tableCard = new Card(model.cardsData["tableCard"]);



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
      //summaryCard.updateData({rows: [{cells: [{value:"1"}]}]});
      summaryCard.updateData({name: "Hello World!"});
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
