//Services
const hyperdom = require('hyperdom');
const h = hyperdom.html;
const http = require('httpism');
const router = require('hyperdom-router');
const model = require('../models/model');
const Helpers = require("../includes/helpers"),
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
  }
  updateData(data) {
    const self = this;
    if(self.data.id){
      var dataKeys = Object.keys(data);
      dataKeys.forEach(function(dataKey) {
        model.cardsData[self.data.id][dataKey] = data[dataKey];
      })
      self.refresh();
    } else {
      console.log("This card doesn't have a reference to a model!")
    }

  }

  render() {
    const self = this;
    return h('div',helpers.assembleCards(this.data, 'card'));
  }
}

module.exports = Card;
