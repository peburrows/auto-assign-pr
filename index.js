const core = require("@actions/core");
const autoAssign = require("./auto-assign");

// most @actions toolkit packages have async methods
async function run() {
  try {
    autoAssign();
    // const ms = core.getInput("milliseconds");
    // console.log(`Waiting ${ms} milliseconds ...`);

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
