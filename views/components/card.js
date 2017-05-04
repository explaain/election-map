//Services
const hyperdom = require('hyperdom');
const h = hyperdom.html;
const http = require('httpism');
const router = require('hyperdom-router');
const model = require('../models/model');
const Helpers = require("../includes/Helpers"),
helpers = new Helpers(model, h, CardTemplates, http, router)

// var self;

var self;

class Card {

  constructor(data) {
    this.data = data;
    self = this;

    // model.data.summary.resultsDeclared = 3;
    // self.refresh();
  }
  updateData(data) {
    var dataKeys = Object.keys(data);
    dataKeys.forEach(function(dataKey) {
      self.data[dataKey] = data[dataKey];
    })
  }

  render() {
    const self = this;
    console.log('this.data');
    console.log(this.data);
    return h('div',helpers.assembleCards(this.data, 'card'));
  }
}


setTimeout(function() {
  model.data.summary.resultsDeclared = 3;
  self.refresh();
}, 5000)

module.exports = Card;
