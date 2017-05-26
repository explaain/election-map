//Services
const http = require('httpism');
const hyperdom = require('hyperdom');
const router = require('hyperdom-router');
const h = hyperdom.html;
const model = require('./models/model');
const Helpers = require("./includes/helpers");

helpers = new Helpers(model, h, CardTemplates, http, router);

//Components
const App = require('./components/app');

var client = algoliasearch(conf.algoliaId, conf.algoliaPublic)
var index1 = client.initIndex('map-pa-'+(conf.paFetchMode==="LIVE"?"live":"test"));
var index2 = client.initIndex('map-parties-'+(conf.paFetchMode==="LIVE"?"live":"test"));
var index3 = client.initIndex('map-constituencies-'+(conf.paFetchMode==="LIVE"?"live":"test"));

const templatesUrl = '//explaain-api.herokuapp.com/templates';
helpers.loadTemplates(templatesUrl).then(function(templates){
  for(var key in templates){
    CardTemplates[key] = templates[key];
  };
  require("../development/templates.js")(CardTemplates);
  console.log(CardTemplates.table)

  var paDataUrl = '/pa-update?test=yes';
  http.get(paDataUrl);

  hyperdom.append(document.body, new App());
});
