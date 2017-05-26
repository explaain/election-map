const conf = require("../conf/conf.js");
const paFetchModeIsLive = conf.paFetchMode==="LIVE";

module.exports = function(app){

  const paDB = require("./pa-db.js");

  var lastFetchedSopt = new Date();
  var lastFetchedConstituencyt = new Date();
  var lastFetchedSopn = 0;
  var sopFetchStatus = "idle";
  var sopFetchTimeout = sopFetchTimeout; // in seconds
  var lastUpdateedFromPA;
  var latestFetchStatus = "idle";

  app.get('/pa/:folder/list', function(req, res) {
    if(!paFetchModeIsLive){console.log("Warning! Using TEST query until the START of election calculation")}
    connectToPA(function(c){
      c.list('/'+(!paFetchModeIsLive?"test/":"")+req.params.folder,function(err, list) {
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
    if(!paFetchModeIsLive){console.log("Warning! Using TEST query until the START of election calculation")}
    connectToPA(function(c){
      c.get('/'+(!paFetchModeIsLive?"test/":"")+req.params.folder+'/'+req.params.file+".xml", function(err, stream) {
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

  app.get("/pa-update", function(req, res){
    if(!paFetchModeIsLive){console.log("Warning! Using TEST query until the START of election calculation")}
    if((new Date())-lastFetchedSopt>conf.sopFetchTimeout*1000 && sopFetchStatus!=="updating"){
      lastFetchedSopt = new Date();
      const parseString = require('xml2js').parseString;
      var lastObservedSop;
      var lastObservedSopn = 0;
      const SopRegExp = new RegExp(!!paFetchModeIsLive?"^Snap_General_Election_Sop_":"^Test_Snap_General_Election_Sop_(\\d+)\.xml$","i")
      connectToPA(function(c){
        const folder = !!paFetchModeIsLive?'/results':'/test/results';
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
      res.send({ok: true, updated: false})
    }
  });

  app.get("/pa-update-latest", function(req, res){
    if(!paFetchModeIsLive){console.log("Warning! Using TEST query until the START of election calculation")}
    if((new Date())-lastFetchedConstituencyt>conf.sopFetchTimeout*1000 && latestFetchStatus!=="updating"){
      latestFetchStatus = "updating";
      lastFetchedConstituencyt = new Date();
      const parseString = require('xml2js').parseString;
      const SopRegExp = new RegExp(!!paFetchModeIsLive?"^Snap_General_Election_result_":"^Test_Snap_General_Election_result_","i")
      connectToPA(function(c){
        const async = require("async");
        const folder = !!paFetchModeIsLive?'/results':'/test/results';
        c.list(folder, function(err, list) {
          if(err){
            res.send({error: err});
            c.destroy();
          } else {
            list.sort(function(a,b){
              return (new Date(b.date)) - (new Date(a.date))
            })
            const filesToFetch = [];
            list.forEach(function(file){
              var Sopmatch = file.name.match(SopRegExp);
              if(Sopmatch){
                if(filesToFetch.length<4){
                  filesToFetch.push(file.name)
                }
              }
            });
            const data = [];
            async.eachLimit(filesToFetch,1,function(fileToFetch,callback){
              const path = folder+'/'+fileToFetch;
              c.get(path, function(err, stream) {
                if(err){
                  callback();
                } else {
                  const chunks = [];
                  stream.on('data', (chunk) => {
                    chunks.push(chunk.toString());
                  });
                  stream.on('end', () => {
                    const _xml = chunks.join('');
                    const parseString = require('xml2js').parseString;
                    parseString(_xml, function (err, json) {
                      const _data = json.FirstPastThePostResult.Election[0].Constituency[0];
                      data.push({
                        type: _data.$.winningParty===_data.$.sittingParty?"hold":"take",
                        constituency: _data.$.name,
                        constituencyID: _data.$.number,
                        party: _data.Candidate[0].Party[0].$.name
                      })
                      callback();
                    });
                  });
                  stream.on('error', () => {
                    callback();
                  });
                }
              });
            },function(){
              paDB.updateLatest(data,function(){
                latestFetchStatus = "idle";
                res.send({ok: true, updated: true})
                c.destroy();
              });

            })

          }
        });
      });
    } else {
      console.log("Not going to check for a new Sop right now");
      res.send({ok: true, updated: false})
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
    //TODO: sopNumber might be 2,3,4,5,6 etc!
    const sopNumber = "1" /*lastFetchedSopn*/; // not sure here, even at the LIVE TEST on 16 May 2017 they always had "1" suffix
    const async = require("async");
    //TODO: Make sure the prefix for LIVE data is CORRECT!
    const constituencyFilePrefix = paFetchModeIsLive?"Snap_General_Election_result_":"Test_Snap_General_Election_result_";
    async.parallel([
      function(sopUpdated){
        paDB.updateSop(sopJSON,sopUpdated);
      },
      function(allConstituenciesUpdated){
        async.each(sopJSON.FirstPastThePostStateOfParties.ConstituenciesIncluded[0].Constituency,function(constituency,constituencyUpdated){
          getLatestResult(null,1,c,folder,constituencyFilePrefix,constituency,function(xml){
            if(xml){
              const parseString = require('xml2js').parseString;
              parseString(xml, function (err, constituencyJSON) {
                paDB.updateConstituency(constituencyJSON,constituencyUpdated);
              });
            } else {
              // error happened, but still letting it go
              constituencyUpdated();
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

  function getLatestResult(_xml,sopNumber,c,folder,constituencyFilePrefix,constituency,callback){
    const fileName = folder+'/'+constituencyFilePrefix+constituency.$.name.replace(/&/g,"and").replace(/\s/g,"_")+"_"+sopNumber+".xml";
    c.get(fileName, function(err, stream) {
      if(err){
        // In this case ERROR means SUCCESS: if file not found, then the previously
        // fetched XML is the latest!
        console.log("FETCHED: " + constituency.$.name + " " + (sopNumber - 1))
        callback(_xml);
      } else {
        const chunks = [];
        stream.on('data', (chunk) => {
          chunks.push(chunk.toString());
        });
        stream.on('end', () => {
          const _xml = chunks.join('');
          sopNumber++;
          getLatestResult(_xml,sopNumber,c,folder,constituencyFilePrefix,constituency,callback)
        });
        stream.on('error', () => {
          callback();
        });
      }
    });
  }

}
