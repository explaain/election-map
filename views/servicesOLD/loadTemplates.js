module.exports = function(http){
  return function(templateUrl){
    return new Promise(function(resolve,reject){
      http.get(templateUrl)
      .then(function (res) {
        resolve(res.body);
      });
    });
  }
}
