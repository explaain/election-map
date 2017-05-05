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

app.get('/pa/nominations/list', function(request, response) {
  connectToPA(function(c){
    c.list('/nominations',function(err, list) {
      var result = {
        nominations: []
      };
      list.forEach(function(item){
        if(item.name.match(/\.xml$/i)){
          result.nominations.push(item.name.replace(/\.xml$/i,""));
        }
      })
      response.send(result)
      c.end();
    });
  })
});

app.get("/pa/nominations/get/:file", function(request, response){
  connectToPA(function(c){
    c.get('/nominations/'+request.params.file+".xml", function(err, stream) {
      if (err) throw err;
      stream.once('close', function() { c.end(); });
      stream.pipe(fs.createWriteStream('test.xml'));
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
    password: "pnpj5k7p",
  });
}

