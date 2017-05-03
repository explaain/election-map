const hyperdom = require('hyperdom');
const h = hyperdom.html;
// const getObjectPathProperty = require('./getObjectPathProperty');

const self = {};

function assembleCards() {

}


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

var updateObject = function(obj, objUpdates) {
  var objKeys = Object.keys(objUpdates);
  objKeys.forEach(function(key) {
    obj[key] = objUpdates[key];
  })
  return obj;
}

var markdownToHtml = function(text) {
  return text ? text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g,"<a class='internal' tabindex='-1' href='$2'>$1</a>") : '';
}



assembleCards.prototype.cards = function(data, template) {
  data.type = data.type || (data["@type"] ? data["@type"].split('/')[data["@type"].split('/').length-1] : 'Detail');
  if (typeof template == 'string') { template = CardTemplates[template]; }
  console.log(template);
  const dom = template.map(function(element) {
    var content,
        attr = {};
    if(
      element.condition
      &&
      (
        !getObjectPathProperty(data, element.condition) && !element.condition.match(/^!/)
        ||
        getObjectPathProperty(data, element.condition.replace(/^!/),"") && element.condition.match(/^!/)
      )
    )
      return undefined;
    else if (element.template)
      content = self.assembleCards(data, CardTemplates[element.template.var ? getObjectPathProperty(data, element.template.var) : element.template])
    else if (!element.content)
      content = '';
    else if (element.loop)
      content = getObjectPathProperty(data, element.loop).map(function(el){return self.assembleCards(el, element.content)});
    else if (element.content.constructor === Array)
      content = self.assembleCards(data, element.content);
    else if (element.content.var)
      content = getObjectPathProperty(data, element.content.var) || ''; //'var' MUST use dot notation, not []
    else
      content = element.default ? element.default : element.content;

    if (element.attr) {
      var attrKeys = Object.keys(element.attr);
      attrKeys.forEach(function(attrKey) {
        if (attrKey == "style" && typeof(element.attr.style) == "object") {
          var styleKeys = Object.keys(element.attr.style);
          var styles = {}
          styleKeys.forEach(function(styleKey) {
            var style = element.attr.style[styleKey];
            styles[styleKey] = style.var ? getObjectPathProperty(data, style.var) : style; //'var' MUST use dot notation, not []
            if (styleKey == "background-image" && style.var) {
              styles[styleKey] = 'url("' + styles[styleKey] + '")'
            }
          });
          attr[attrKey] = styles;
        } else {
          attr[attrKey] = element.attr[attrKey].var ? getObjectPathProperty(data, element.attr[attrKey].var) :  element.attr[attrKey]; //'var' MUST use dot notation, not []
        }
      })
    }
    if (element.content && element.content.markdown) {
      return h.rawHtml(element.dom, attr, markdownToHtml(content));
    } else {
      return h(element.dom, attr, content);
    }
  });
  return dom;
}

self.assembleCards = assembleCards.prototype.cards

module.exports = new assembleCards();
