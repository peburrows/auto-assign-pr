const core = require("@actions/core");
const autoAssign = require("./auto-assign");

// most @actions toolkit packages have async methods
async function run() {
  try {
    autoAssign();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
