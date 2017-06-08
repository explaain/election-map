const colors = require('colors/safe');

module.exports = {
  consoleError: function(text){
    console.log(colors.red("E: " + text));
  },
  consoleWarning: function(text){
    console.log(colors.yellow("W: " + text));
  },
  consoleInfo: function(text){
    console.log("I: " + text);
  },
  consoleSuccess: function(text){
    console.log(colors.green("S: " + text));
  }
}
