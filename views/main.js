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

  console.log(CardTemplates);

  var paDataUrl = '/pa/results/list?test=yes';
  var paDataUrl = '/pa/results/get/Test_Snap_General_Election_All_SOP_102?test=yes';
  http.get(paDataUrl)
  .then(function(res) {
    console.log(res.body);
    PaData.Ge2017_SOP = res.body.FirstPastThePostStateOfParties;
    PaData.constituencyData = {};
    return http.get('pa/results/get/Test_Snap_General_Election_result_Aberavon_1?test=yes')
  }).then(function(res) {
    console.log(res.body)
    var election = res.body.FirstPastThePostResult.Election[0];
    PaData.constituencyData[election.Constituency[0].$.number] = election.Constituency;

    hyperdom.append(document.body, new App());
  })
});
