const conf = require("../conf/conf.js");
const paFetchModeIsLive = conf.paFetchMode==="LIVE";
const helpers = require("./helpers");

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
          helpers.consoleError("PAFL: Folder not found");
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
      const filePath = '/'+(!paFetchModeIsLive?"test/":"")+req.params.folder+'/'+req.params.file+".xml";
      c.get(filePath, function(err, stream) {
        if(err){
          helpers.consoleError("PAFGF: File not found: " + filePath);
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
          stream.on('error', () => {
            helpers.consoleError("PAFGF: Stream broke");
            res.send({error: "Stream broke"});
            c.destroy();
          });
        }
      })
    })
  })

  app.get("/pa-update", function(req, res){
    if(!paFetchModeIsLive){
      helpers.consoleWarning("PU: Warning! Using TEST query until the START of election calculation")
    }
    if((new Date())-lastFetchedSopt>conf.sopFetchTimeout*1000 && sopFetchStatus!=="updating"){
      lastFetchedSopt = new Date();
      const parseString = require('xml2js').parseString;
      var lastObservedSop;
      var lastObservedSopn = 0;
      const SopRegExp = new RegExp(!!paFetchModeIsLive?"^Snap_General_Election_Sop_(\\d+)\.xml":"^Test_Snap_General_Election_Sop_(\\d+)\.xml$","i")
      connectToPA(function(c){
        const folder = paFetchModeIsLive?'/results':'/test/results';
        c.list(folder, function(err, list) {
          if(err){
            helpers.consoleError("PU: Folder not found: " + folder);
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
              helpers.consoleInfo("PU: New Sop published. Fetching...")
              const filePath = folder+'/'+lastObservedSop;
              c.get(filePath, function(err, stream) {
                if(err){
                  helpers.consoleError("PU: File not found: " + filePath);
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
                  stream.on('error', () => {
                    helpers.consoleError("PU: Stream broke");
                    res.send({error: "Stream broke"});
                    c.destroy();
                  });
                }
              })
            } else {
              helpers.consoleInfo("PU: No new Sop published. No fetch needed.");
              res.send({ok: true, updated: false})
              c.destroy();
            }
          }
        });
      },function(){
        helpers.consoleError("PU: Cound not connect to PA");
        res.send({error: "Cound not connect to PA"});
      });
    } else {
      //helpers.consoleInfo("PU: Not going to check for a new Sop right now");
      res.send({ok: true, updated: false})
    }
  });

  app.get("/pa-update-latest", function(req, res){
    if(!paFetchModeIsLive){
      helpers.consoleWarning("PUL: Warning! Using TEST query until the START of election calculation");
    }
    if((new Date())-lastFetchedConstituencyt>conf.sopFetchTimeout*1000 && latestFetchStatus!=="updating"){
      helpers.consoleInfo("PUL: Fetching latest results...")
      latestFetchStatus = "updating";
      lastFetchedConstituencyt = new Date();
      const parseString = require('xml2js').parseString;
      const SopRegExp = new RegExp(!!paFetchModeIsLive?"^Snap_General_Election_result_":"^Test_Snap_General_Election_result_","i")
      connectToPA(function(c){
        const async = require("async");
        const folder = paFetchModeIsLive?'/results':'/test/results';
        c.list(folder, function(err, list) {
          if(err){
            helpers.consoleError("PUL: Folder not found: " + folder);
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
                  helpers.consoleError("PUL: File not found: " + fileToFetch);
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
                    helpers.consoleError("PUL: Stream broke");
                    callback();
                  });
                }
              });
            },function(){
              paDB.updateLatest(data,function(){
                helpers.consoleSuccess("PUL: Update finished");
                latestFetchStatus = "idle";
                res.send({ok: true, updated: true})
                c.destroy();
              });
            });
          }
        });
      },function(){
        helpers.consoleError("PUL: Cound not connect to PA");
      });
    } else {
      //helpers.consoleInfo("PUL: Not going to check for a new Sop right now");
      res.send({ok: true, updated: false})
    }
  });

  function connectToPA(callback,onerror){
    var Client = require('ftp');
    var c = new Client();
    c.on('ready', function() {
      callback(c);
    });
    c.on('error', function() {
      onerror();
    });
    c.connect({
      host: "ftpout.pa.press.net",
      user: "lbc_elections",
      password: "pnpj5k7p"
    });
  }

  function traverseSop(sopJSON,c,folder,req,res){
    const async = require("async");
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
                if(!err){
                  paDB.updateConstituency(constituencyJSON,constituencyUpdated);
                } else {
                  helpers.consoleError("TS: XML could not be parsed");
                  constituencyUpdated();
                }
              });
            } else {
              helpers.consoleError("TS: XML could not be found");
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
        helpers.consoleSuccess("PU: Traversal finished");
        res.send({ok: true, updated: true});
      }
    });

  }

  function getLatestResult(_xml,sopNumber,c,folder,constituencyFilePrefix,constituency,callback){
    const fileName = folder+'/'+constituencyFilePrefix+constituency.$.name.replace(/&/g,"and").replace(/\s/g,"_")+"_"+sopNumber+".xml";
    c.get(fileName, function(notFound, stream) {
      if(notFound){
        // In this case notFound means SUCCESS: if file not found, then the previously
        // fetched XML is the latest!
        // console.log("FETCHED: " + constituency.$.name + " " + (sopNumber - 1))
        if(sopNumber - 1 > 0){
          callback(_xml);
        } else { // this is a real error
          helpers.consoleError("GLR: Result file not found!");
        }
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
          helpers.consoleError("GLR: Stream broken");
          callback();
        });
      }
    });
  }
}
