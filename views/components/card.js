//Services
const hyperdom = require('hyperdom');
const h = hyperdom.html;
const http = require('httpism');
const router = require('hyperdom-router');
const model = require('../models/model');
const Helpers = require("../includes/Helpers"),
helpers = new Helpers(model, h, CardTemplates, http, router)

class Card {

  getMyData() {

  }

  constructor(data) {
    if (typeof data === "string") {
      this.data = model[data];
    } else {
      this.data = data;
    }
    const self = this;
    console.log(data)

    // model.data.summary.resultsDeclared = 3;
    // self.refresh();
  }
  updateData(data) {
    const self = this;
    console.log("DATA")
    console.log(data)
    var dataKeys = Object.keys(data);
    console.log(model.cardsData[self.data.id])
    dataKeys.forEach(function(dataKey) {
      console.log(dataKey + " changing to " + data[dataKey])
      model.cardsData[self.data.id][dataKey] = data[dataKey];
    })
    console.log("MODEL")
    console.log(model)
    self.refresh();
  }

  render() {
    const self = this;
    return h('div',helpers.assembleCards(this.data, 'card'));
  }
}

module.exports = Card;
