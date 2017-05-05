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

    // model.data.summary.resultsDeclared = 3;
    // self.refresh();
  }
  updateData(data) {
    console.log('this.data')
    console.log(this.data)
    const self = this;
    var dataKeys = Object.keys(data);
    dataKeys.forEach(function(dataKey) {
      self.data[dataKey] = data[dataKey];
    })
    this.data = self.data;
    console.log('self.data')
    console.log(self.data)
  }

  render() {
    const self = this;
    return h('div',helpers.assembleCards(this.data, 'card'));
  }
}

module.exports = Card;
