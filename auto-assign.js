const core = require("@actions/core");
const github = require("@actions/github");

let autoAssign = function(milliseconds) {
  return new Promise((resolve, reject) => {
    // I want to just see things in here
    core.debug("my github context");
    core.debug(JSON.stringify(github.context));

    if (typeof milliseconds !== "number") {
      throw new Error("milleseconds not a number");
    }

    setTimeout(() => resolve("done!"), milliseconds);
  });
};

module.exports = autoAssign;
