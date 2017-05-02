//Services
const hyperdom = require('hyperdom');
const h = hyperdom.html;
const router = require('hyperdom-router');
const assemble = require('../services/assembleCards');

const routes = {
  home:  router.route('/'),
  contacts: router.route('/contacts'),
};

class Card {
  constructor(data) {
    this.data = data;
  }

  render() {
    return h('div',assemble.cards(this.data, 'card'));
  }
}

module.exports = Card;
