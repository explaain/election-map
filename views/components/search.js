//Services
const hyperdom = require('hyperdom');
const h = hyperdom.html;

class Search {
  constructor(selectConstituency) {
    const self = this;
    this.selectConstituency = selectConstituency;

    var client = algoliasearch("I2VKMNNAXI", "2b8406f84cd4cc507da173032c46ee7b")
    var index = client.initIndex('constituencies');
    autocomplete('#search-input', {hint: false}, [
      {
        source: autocomplete.sources.hits(index, {hitsPerPage: 5}),
        displayKey: 'name',
        templates: {
          suggestion: function(suggestion) {
            return suggestion._highlightResult.name.value;
          }
        }
      }
    ]).on('autocomplete:selected', function(event, suggestion, dataset) {
      self.selectConstituency(suggestion);
    });
  }

  render() {
    return h('input.search-input', { "type": "text" });
  }
}

module.exports = Search;
