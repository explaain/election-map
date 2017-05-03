module.exports = class Helpers {

  constructor(model, h, http) {
    this.http = http;
    console.log(http);
    console.log(http);
    console.log(http);
    this.model = model;
    this.h = h;
  }

  assembleCards(data, template) {
    const self = this;
    data.type = data.type || (data["@type"] ? data["@type"].split('/')[data["@type"].split('/').length-1] : 'Detail');
    if (typeof template === 'string') { template = CardTemplates[template]; }
    const element = template;
    var params = {};
    if(element.mapping){
      element.mapping.forEach(function(kv){
        params[kv[0]] = self.getObjectPathProperty(data, kv[1]);
      });
    } else {
      params = data;
    }
    var content,
      attr = {};
    if(
      element.condition
      &&
      (
        !self.getObjectPathProperty(params, element.condition) && !element.condition.match(/^!/)
        ||
        self.getObjectPathProperty(params, element.condition.replace(/^!/,"")) && element.condition.match(/^!/)
      )
    )
      return undefined;
    else if (element.template)
      content = self.assembleCards(params, element.template.var ? self.getObjectPathProperty(params, element.template.var) : element.template)
    else if (!element.content)
      content = '';
    else if (element.loop)
      content = self.getObjectPathProperty(params, element.loop).map(function(_params){return element.content.map(function(_element){return self.assembleCards(_params, _element);})});
    else if (element.content.constructor === Array)
      content = element.content.map(function(el){return self.assembleCards(params, el); });
    else if (element.content.var)
      content = self.getObjectPathProperty(params, element.content.var) || ''; //'var' MUST use dot notation, not []
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
            styles[styleKey] = style.var ? self.getObjectPathProperty(data, style.var) : style; //'var' MUST use dot notation, not []
            if (styleKey == "background-image" && style.var) {
              styles[styleKey] = 'url("' + styles[styleKey] + '")'
            }
          });
          attr[attrKey] = styles;
        } else {
          attr[attrKey] = element.attr[attrKey].var ? self.getObjectPathProperty(params, element.attr[attrKey].var) :  element.attr[attrKey]; //'var' MUST use dot notation, not []
        }
      })
    }
    if (!element.dom && element.template){
      return content;
    } else if (element.content && element.content.markdown) {
      return self.h.rawHtml(element.dom, attr, self.markdownToHtml(content));
    } else {
      console.log('element')
      console.log(element)
      return self.h(element.dom, attr, content);
    }
  }

  getModel(path){
    const self = this;
    return self.getObjectPathProperty(self.model, path);  // a moving reference to internal objects within model
  }

  getObjectPathProperty(object, path){
    const self = this;
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

  loadTemplates(templateUrl){
    const self = this;
    return new Promise(function(resolve,reject){
      self.http.get(templateUrl)
      .then(function (res) {
        resolve(res.body);
      });
    });
  }

  markdownToHtml(text) {
    const self = this;
    return text.replace(
      /\[([^\]]+)\]\(([^\)]+)\)/g,
      "<a class='internal' tabindex='-1' href='$2'>$1</a>"
    );
  }

  updateData(dataUpdates) {
    const self = this;
    dataUpdates.forEach(function(update) {
      self.updateModel(update.data, update.value, update.action);
    });
  }

  updateModel(path, value, action) {
    const self = this;
    var schema = self.model;  // a moving reference to internal objects within model
    var pList = path.split('.');
    var len = pList.length;
    for(var i = 0; i < len-1; i++) {
      var elem = pList[i];
      if( !schema[elem] ) schema[elem] = {}
      schema = schema[elem];
    }
    switch(action){
      case "toggle":
        if(schema[pList[len-1]]){
          delete schema[pList[len-1]];
        } else {
          schema[pList[len-1]] = value;
        }
        break;
      default:
        schema[pList[len-1]] = value;
    }
  }

  updateObject(obj, objUpdates) {
    const self = this;
    var objKeys = Object.keys(objUpdates);
    objKeys.forEach(function(key) {
      obj[key] = objUpdates[key];
    })
    return obj;
  }

}
