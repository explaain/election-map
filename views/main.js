//Services
const http = require('httpism');
const hyperdom = require('hyperdom');
const router = require('hyperdom-router');
const h = hyperdom.html;
const model = require('./models/model');
const Helpers = require("./includes/Helpers");


helpers = new Helpers(model, h, CardTemplates, http, router);

//Components
const App = require('./components/app');


const templatesUrl = '//explaain-api.herokuapp.com/templates';
helpers.loadTemplates(templatesUrl).then(function(templates){
  for(var key in templates){
    CardTemplates[key] = templates[key];
  };

  console.log(CardTemplates)

  hyperdom.append(document.body, new App());
});
