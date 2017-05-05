var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/pa/:folder/list', function(request, response) {
  connectToPA(function(c){
    c.list('/'+(request.query.test?"test/":"")+request.params.folder,function(err, list) {
      if(err){
        response.send({error: "Folder not found"});
      } else {
        const result = {};
        result[request.params.folder] = [];
        list.forEach(function(item){
          if(item.name.match(/\.xml$/i)){
            result[request.params.folder].push(item.name.replace(/\.xml$/i,""));
          }
        })
        response.send(result)
      }
      c.end();
    });
  })
});

app.get("/pa/:folder/get/:file", function(request, response){
  connectToPA(function(c){
    c.get('/'+(request.query.test?"test/":"")+request.params.folder+'/'+request.params.file+".xml", function(err, stream) {
      if(err){
        response.send({error: "File not found"});
        c.end();
      } else {
        const chunks = [];
        stream.on('data', (chunk) => {
          chunks.push(chunk.toString());
        });
        stream.on('end', () => {
          const xml = chunks.join('');
          const parseString = require('xml2js').parseString;
          parseString(xml, function (err, result) {
            response.send(result);
            c.end();
          });
        });
      }
    })
  })
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function connectToPA(callback){
  var Client = require('ftp');
  var c = new Client();
  c.on('ready', function() {
    callback(c);
  });
  c.connect({
    host: "ftpout.pa.press.net",
    user: "lbc_elections",
    password: "pnpj5k7p"
  });
}

function updateFromPA(callback){
  connectToPA(function(c){
    // todo
  });
}


