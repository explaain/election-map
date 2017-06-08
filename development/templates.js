module.exports = function(CardTemplates){
  CardTemplates.table = {
    "dom": "div.content",
    "content": [
      {
        "dom": "h2",
        "condition": "showCandidates",
        "content": {
          "var": "name"
        }
      },
      {
        "dom": "div.local-candidates-container",
        "condition": "showCandidates",
        "loop": "localCandidates",
        "content": [{"template": "localCandidatePlate"}]
      },
      {
        "dom": "h2",
        "content": {
          "var": "tableName"
        }
      },
      {
        "dom": "div.body-content",
        "content": [
          {
            "dom": "div.fade-mask",
            "content": [
              {
                "dom": "i.fa.fa-chevron-circle-right"
              }
            ]
          },
          {
            "dom": "table",
            "condition": "rowsExist",
            "loop": "rows",
            "content": [
              {
                "template": "row"
              }
            ]
          },
          {
            "dom": "p",
            "condition": "!rowsExist",
            "content": "Sorry, there is no data yet"
          },
          {
            "dom": "p",
            "condition": "selectedConstituency",
            "content": [
              {
                "dom": "button.selectAnotherConstituency",
                "content": "Select another constituency",
                "attr": {
                  "onclick": {
                    "var": "deselectConstituency"
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  }
  CardTemplates.localCandidatePlate = {
    "dom": "a.local-candidate-plate.internal",
    "attr":{
      "onclick": {
        "var": "openCandidate"
      }
    },
    "content": [
      {
        "dom": "div.lc-image",
        "attr": {
          "style": {
            "background-image": {
              "var": "image_url"
            }
          },
        },
      },
      {
        "dom": "h3.lc-name",
        "content": {
          "var": "name"
        }
      },
      {
        "dom": "h4.lc-party-name",
        "content": {
          "var": "party_name"
        }
      }
    ]
  }
  CardTemplates.constituencyDeselector = {
    "dom": ".constituencyDeselector",
    "content": [
      {
        "dom": "i.fa.fa-times"
      }
    ],
    "condition": "selectedConstituency",
    "attr": {
      "onclick": {
        "var": "deselectConstituency"
      }
    }
  }
  CardTemplates.list = {
    "dom": "div.content",
    "content": [
      {
        "dom": "h2",
        "content": {
          "var": "name"
        }
      },
      {
        "dom": "div.body-content",
        "content": [
          {
            "dom": "ul",
            "loop": "items",
            "content": [
              {
                "dom": "li",
                "content": {
                  "var": "value"
                },
                "attr": {
                  "onclick": {
                    "var": "action"
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  }
  CardTemplates.votes = {
     "dom":"div.content",
     "content":[
        {
           "dom":"h2",
           "content":{
              "var":"name"
           }
        },
        {
           "dom":"div.body-content",
           "content":[
              {
                "condition": "partiesExist",
                 "dom":"div",
                 "loop":"parties",
                 "content":[
                    {
                       "dom":"div.seats",
                       "content":{
                          "var":"seats"
                       }
                    },
                    {
                       "dom":"p.name",
                       "content":{
                          "var":"name"
                       }
                    },
                    {
                       "template":"progress-bar"
                    }
                 ]
              },
              {
                "condition": "!partiesExist",
                 "dom":"div",
                 "content":"Sorry, there is no data yet"
              }
           ]
        }
     ]
  }
  CardTemplates.list = {
     "dom":"div.content",
     "content":[
        {
           "dom":"h2",
           "content":{
              "var":"name"
           }
        },
        {
           "dom":"div.body-content",
           "content":[
              {
                "condition": "itemsExist",
                 "dom":"ul",
                 "loop":"items",
                 "content":[
                    {
                       "dom":"li",
                       "content":{
                          "var":"value"
                       },
                       "attr":{
                          "onclick":{
                             "var":"action"
                          }
                       }
                    }
                 ]
              },
              {
                "condition": "!itemsExist",
                 "dom":"div",
                 "content":"Sorry, there is no data yet"
              }
           ]
        }
     ]
  }
  CardTemplates.stats = {
     "dom":"div.content",
     "content":[
        {
           "dom":"h2",
           "content":{
              "var":"name"
           }
        },
        {
           "dom":"div.body-content",
           "content":[
              {
                "condition": "rowsExist",
                 "dom":"table.stats.blank",
                 "loop":"rows",
                 "content":[
                    {
                       "template":"row"
                    }
                 ]
              },
              {
                "condition": "!rowsExist",
                 "dom":"div",
                 "content":"Sorry, there is no data yet"
              }
           ]
        }
     ]
  }
};
