//Services
const hyperdom = require('hyperdom');
const h = hyperdom.html;
const http = require('httpism');
const router = require('hyperdom-router');
const model = require('../models/model');
const Helpers = require("../includes/Helpers"),
helpers = new Helpers(model, h, http)

var self;

class Card {

  constructor(data) {
    this.data = data;
    self = this;
  }
  updateData(data) {
    var dataKeys = Object.keys(data);
    dataKeys.forEach(function(dataKey) {
      self.data[dataKey] = data[dataKey];
    })
  }

  render() {
    return h('div',helpers.assembleCards(this.data, 'card'));
  }
}

module.exports = Card;
