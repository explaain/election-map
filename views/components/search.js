//Services
const hyperdom = require('hyperdom');
const h = hyperdom.html;

class Search {
  constructor(selectConstituency) {
    const self = this;
    this.selectConstituency = selectConstituency;

    var client = algoliasearch(conf.algoliaId, conf.algoliaPublic)
    var index = client.initIndex('constituencies');
    $('#search-input').on("click",function(){
      $('#search-input').val("");
    })
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
      mixpanel.track("Selected from search", {constituencySuggestion: suggestion});
      $('#search-input').blur();
      self.selectConstituency(suggestion);
    });
  }

  render() {
    return h('input.search-input', { "type": "text" });
  }
}

module.exports = Search;
