const core = require("@actions/core");
const github = require("@actions/github");

let autoAssign = function(milliseconds) {
  return new Promise((resolve, reject) => {
    // I want to just see things in here
    console.log("my github context");
    console.log(JSON.stringify(github.context.payload.draft));

    setTimeout(() => resolve("done!"), 1000);
  });
};

module.exports = autoAssign;
