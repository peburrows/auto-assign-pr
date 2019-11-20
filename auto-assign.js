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

    let pull_number = github.context.payload.pull_request.number;

    let url = github.context.payload.pull_request.url + "/requested_reviewers";
    let token = core.getInput("github-token", { required: true });
    const octokit = new github.GitHub(token);
    // console.log("my client:", octokit);
    // const pulls = await octokit.pulls.list({
    //   owner: github.context.payload.pull_request.base.repo.owner.login,
    //   repo: github.context.payload.pull_request.base.repo.name
    // });

    // console.log("my pulls", pulls);
    const owner = github.context.payload.pull_request.base.repo.owner.login;
    const repo = github.context.payload.pull_request.base.repo.name;

    console.log(
      "owner, repo, reviewers, pull_number",
      owner || "N",
      repo || "N",
      reviewers || "N",
      pull_number || "N"
    );

    let resp = await octokit.pulls.createReviewRequest({
      owner,
      repo,
      reviewers,
      pull_number
    });

    console.log("response: ", resp);
  });
};

module.exports = autoAssign;
