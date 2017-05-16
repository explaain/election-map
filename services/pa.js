const conf = require("../conf/conf.js");

module.exports = function(app){

  const paDB = require("./pa-db.js");

  var lastFetchedSopt = new Date();
  var lastFetchedSopn = 0;
  var sopFetchStatus = "idle";
  var sopFetchTimeout = sopFetchTimeout; // in seconds
  var lastUpdateedFromPA;

  app.get('/pa/:folder/list', function(req, res) {
    if(req.query.test){console.log("Warning! You are using TEST query")}
    connectToPA(function(c){
      c.list('/'+(req.query.test?"test/":"")+req.params.folder,function(err, list) {
        if(err){
          res.send({error: "Folder not found"});
        } else {
          const result = {};
          result[req.params.folder] = [];
          list.forEach(function(item){
            if(item.name.match(/\.xml$/i)){
              result[req.params.folder].push(item.name.replace(/\.xml$/i,""));
            }
          })
          res.send(result)
        }
        c.destroy();
      });
    })
  });

  app.get("/pa/:folder/get/:file", function(req, res){
    if(req.query.test){console.log("Warning! You are using TEST query")}
    connectToPA(function(c){
      c.get('/'+(req.query.test?"test/":"")+req.params.folder+'/'+req.params.file+".xml", function(err, stream) {
        if(err){
          res.send({error: "File not found"});
          c.destroy();
        } else {
          const chunks = [];
          stream.on('data', (chunk) => {
            chunks.push(chunk.toString());
          });
          stream.on('end', () => {
            const xml = chunks.join('');
            const parseString = require('xml2js').parseString;
            parseString(xml, function (err, result) {
              res.send(result);
            });
            c.destroy();
          });
        }
      })
    })
  })

  // todo: this also needs a reasonable timeout, let's say 10 secs, otherwise we will pollute PA with useless requests

  app.get("/pa-update", function(req, res){
    if(req.query.test){console.log("Warning! You are using TEST query")}
    if((new Date())-lastFetchedSopt>conf.sopFetchTimeout*1000 && sopFetchStatus!=="updating"){
      lastFetchedSopt = new Date();
      const parseString = require('xml2js').parseString;
      var lastObservedSop;
      var lastObservedSopn = 0;
      const SopRegExp = new RegExp(!req.query.test?"todo: OTHER REG EXP":"^Test_Snap_General_Election_Sop_(\\d+)\.xml$","i")
      connectToPA(function(c){
        const folder = !req.query.test?'/results':'/test/results';
        c.list(folder, function(err, list) {
          if(err){
            res.send({error: err});
            c.destroy();
          } else {
            list.forEach(function(file){
              var Sopmatch = file.name.match(SopRegExp);
              if(Sopmatch){
                const Sopn = parseInt(Sopmatch[1]);
                if(lastObservedSopn < Sopn){
                  lastObservedSopn = Sopn;
                  lastObservedSop = file.name;
                }
              }
            })
            if(lastObservedSopn>lastFetchedSopn){
              sopFetchStatus = "updating"
              lastFetchedSopn = lastObservedSopn;
              console.log("New Sop published. Fetching...")
              c.get(folder+'/'+lastObservedSop, function(err, stream) {
                if(err){
                  res.send({error: "File not found"});
                  c.destroy();
                } else {
                  const chunks = [];
                  stream.on('data', (chunk) => {
                    chunks.push(chunk.toString());
                  });
                  stream.on('end', () => {
                    const xml = chunks.join('');
                    const parseString = require('xml2js').parseString;
                    parseString(xml, function (err, sopJSON) {
                      traverseSop(sopJSON,c,folder,req,res);
                    });
                  });
                }
              })
            } else {
              console.log("No new Sop published. No fetch needed.");
              res.send({ok: true, updated: false})
              c.destroy();
            }
          }
        });
      });
    } else {
      console.log("Not going to check for a new Sop right now");
    }
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

  function traverseSop(sopJSON,c,folder,req,res){
    const sopNumber = "1" /*lastFetchedSopn*/; // not sure here, even at the LIVE TEST on 16 May 2017 they always had "1" suffix
    const async = require("async");
    const constituencyFilePrefix = !req.query.test?"todo: PREFIX":"Test_Snap_General_Election_result_";
    async.parallel([
      function(sopUpdated){
        paDB.updateSop(sopJSON,sopUpdated);
      },
      function(allConstituenciesUpdated){
        async.each(sopJSON.FirstPastThePostStateOfParties.ConstituenciesIncluded[0].Constituency,function(constituency,constituencyUpdated){
          const fileName = folder+'/'+constituencyFilePrefix+constituency.$.name.replace(/&/g,"and").replace(/\s/g,"_")+"_"+sopNumber+".xml";
          c.get(fileName, function(err, stream) {
            if(err){
              console.log("Error: '"+fileName+"' not found on FTP server");
              constituencyUpdated();
            } else {
              const chunks = [];
              stream.on('data', (chunk) => {
                chunks.push(chunk.toString());
              });
              stream.on('end', () => {
                console.log("Fetched: '"+fileName+"'");
                const xml = chunks.join('');
                const parseString = require('xml2js').parseString;
                parseString(xml, function (err, constituencyJSON) {
                  paDB.updateConstituency(constituencyJSON,constituencyUpdated);
                });
              });
              stream.on('error', () => {
                console.log("Stream error");
                constituencyUpdated();
              });
            }
          });
        },function(){
          allConstituenciesUpdated();
        })
      }
    ],function(err){
      c.destroy()
      if(err){
        res.send({error: err});
      } else {
        sopFetchStatus = "idle";
        console.log("Done!")
        res.send({ok: true, updated: true});
      }
    });

  }

}
