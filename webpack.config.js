const path = require("path");
console.log(path.resolve(__dirname, "js"));

module.exports = {
  entry: {
    "facialAIbundle.js": [path.resolve(__dirname, "js/entry.js")],
  },
  output: {
    filename: "[name]",
    path: path.resolve(__dirname, "js"),
  },
  mode: "production",
  module: {
    rules: [{ exclude: /node_modules/ }],
  },
};
