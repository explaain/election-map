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

var client = algoliasearch("I2VKMNNAXI", "2b8406f84cd4cc507da173032c46ee7b")
var index1 = client.initIndex('ge2017-pa');
var index2 = client.initIndex('ge2017-parties');
var index3 = client.initIndex('constituencies');

const templatesUrl = '//explaain-api.herokuapp.com/templates';
helpers.loadTemplates(templatesUrl).then(function(templates){
  for(var key in templates){
    CardTemplates[key] = templates[key];
  };

  console.log(CardTemplates);

  // var paDataUrl = '/pa/results/list?test=yes';

  var paDataUrl = '/pa-update?test=yes';
  http.get(paDataUrl);

  index1.search('', function searchDone(err, content) {
    if (err) {
      console.error(err);
      return;
    }

    model.data.summary = content.hits[0];

    for (var h in content.hits) {
      console.log('Hit(' + content.hits[h].objectID + '): ' + content.hits[h].toString());
    }

    index2.search('', function searchDone(err, content) {
      if (err) {
        console.error(err);
        return;
      }

      model.data.detailsByParty = content.hits;

      for (var h in content.hits) {
        console.log('Hit(' + content.hits[h].objectID + '): ' + content.hits[h].toString());
      }



      index3.search('', {
        hitsPerPage: 650
      }, function searchDone(err, content) {
        if (err) {
          console.error(err);
          return;
        }

        model.data.constituencies = content.hits;

        for (var h in content.hits) {
          console.log('Hit(' + content.hits[h].objectID + '): ' + content.hits[h].toString());
        }

        hyperdom.append(document.body, new App());
      });
    });
  });
});
