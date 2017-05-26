module.exports = function(CardTemplates){
  CardTemplates.table = {
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
};
