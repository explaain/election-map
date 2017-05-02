//Services
const http = require('httpism');
const hyperdom = require('hyperdom');
const loadTemplates = require('./services/loadTemplates')(http);

//Components
const App = require('./components/app');


const templatesUrl = '//explaain-api.herokuapp.com/templates';
loadTemplates(templatesUrl).then(function(templates){
  for(var key in templates){
    CardTemplates[key] = templates[key];
  };

  console.log(CardTemplates);

  hyperdom.append(document.body, new App());
});
