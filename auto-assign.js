const core = require("@actions/core");
const github = require("@actions/github");

let autoAssign = function() {
  return new Promise(async (resolve, reject) => {
    // I want to just see things in here
    console.log("my github url");
    // console.log(github.context.payload.pull_request);
    console.log(github.context.payload.pull_request.url);
    console.log("draft?");
    console.log(github.context.payload.pull_request.draft);
    console.log("reviewers:");
    console.log(github.context.payload.pull_request.requested_reviewers);

    reviewers = {
      reviewers: ["bvandorn"]
    };

    let pull_number = github.context.payload.pull_request.id;

    let url = github.context.payload.pull_request.url + "/requested_reviewers";
    let token = core.getInput("github-token");
    console.log("my token:", token);
    const octokit = new github.GitHub({ auth: token });
    let resp = await octokit.pulls.createReviewRequest({
      owner: github.context.payload.pull_request.base.repo.owner.login,
      repo: github.context.payload.pull_request.base.repo.name,
      reviewers,
      pull_number
    });

    console.log("response: ", resp);
  });
};

module.exports = autoAssign;
