//Services
const hyperdom = require('hyperdom');
const h = hyperdom.html;
const router = require('hyperdom-router');

//Components
const ClickMap = require('./map');
const Card = require('./card');



const routes = {
  home:  router.route('/'),
  contacts: router.route('/contacts'),
};

class App {
  constructor() {
    router.start({history: router.hash});
  }

  // renderHome() {
  //   return h('div','Home');
  // }
  //
  // renderContacts() {
  //   return h('div','Contacts')
  // }

  render() {
    const ukMap = new ClickMap;
    const seatsCard = new Card({name:"Seats at a Glance", description: "Conservatives, Labour, Lib Dems", type: "Organization", image: "http://www.planwallpaper.com/static/images/Abstract-Cool-Background.jpg"});


    console.log('ukMap')
    console.log(ukMap);
    console.log('seatsCard')
    console.log(seatsCard);
    var returnable = h('div.app',
      ukMap,
      seatsCard
    );
    console.log('returnable')
    console.log(returnable);
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
