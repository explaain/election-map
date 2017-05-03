//Services
const http = require('httpism');
const hyperdom = require('hyperdom');
const h = hyperdom.html;
const model = require('./models/model');
const Helpers = require("./includes/Helpers"),
helpers = new Helpers(model, h, http)

//Components
const App = require('./components/app');


const templatesUrl = 'http://localhost:5002/templates';
helpers.loadTemplates(templatesUrl).then(function(templates){
  for(var key in templates){
    CardTemplates[key] = templates[key];
  };

  hyperdom.append(document.body, new App());
});
