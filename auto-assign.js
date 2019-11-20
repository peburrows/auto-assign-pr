const core = require("@actions/core");
const github = require("@actions/github");

let autoAssign = function(milliseconds) {
  return new Promise((resolve, reject) => {
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

    let url = github.context.payload.pull_request.url + "/requested_reviewers";
    let token = process.env.GITHUB_TOKEN;
    const octokit = new github.GitHub(token);
    let resp = await octokit.pulls.createReviewRequest({
      owner: github.context.payload.pull_request.base.repo.owner.login,
      repo: github.context.payload.pull_request.base.repo.name,
      reviewers: reviewers
    });

    console.log("response: ", resp)

    // setTimeout(() => resolve("done!"), 1000);
  });
};

module.exports = autoAssign;
