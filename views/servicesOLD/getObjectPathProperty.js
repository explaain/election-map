module.exports = function(){
  const getObjectPathProperty = function(object, path){
    var schema = object;  // a moving reference to internal objects within the object
    var pList = path.split('.');
    var len = pList.length;
    for(var i = 0; i < len-1; i++) {
      var elem = pList[i];
      if( !schema[elem] ) schema[elem] = {}
      schema = schema[elem];
    }
    return schema[pList[len-1]];
  }

  return getObjectPathProperty;
}
