const core = require("@actions/core");
const autoAssign = require("./auto-assign");

// most @actions toolkit packages have async methods
async function run() {
  try {
    console.log("running my action...");
    autoAssign();

    // core.debug(new Date().toTimeString());
    // // wait(parseInt(ms));
    // autoAssign();
    // core.debug(new Date().toTimeString());

    // core.setOutput("time", new Date().toTimeString());
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
