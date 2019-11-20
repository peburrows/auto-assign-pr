const core = require("@actions/core");
const github = require("@actions/github");

let autoAssign = function() {
  return new Promise(async (resolve, reject) => {
    // we should remove the current author from this list
    const reviewerList = JSON.parse(core.getInput("draft-approvers"), {
      required: true
    });

    const {
      pull_number,
      draft,
      requested_reviewers,
      url,
      base
    } = github.context.payloast.pull_request;

    const token = core.getInput("github-token", { required: true });
    const octokit = new github.GitHub(token);

    if (draft && requested_reviewers.length === 0) {
      console.log("draft PR with no current reviewers, so will add one");

      const owner = base.repo.owner.login,
        repo = base.repo.name;

      const reviewerUrl = url + "/requested_reviewers";

      await octokit.pulls.createReviewRequest({
        owner,
        repo,
        reviewers,
        pull_number
      });
    } else if (action === "ready_for_review") {
      // draft converted to normal PR, so dismiss all reviews
      const reviews = octokit.pulls.listReviews({
        owner,
        repo,
        pull_number
      });

      reviews.forEach(r => {
        console.log("dismissing review from ", r.user.login);
        octokit.pulls.dismissReview({
          owner,
          repo,
          pull_number,
          review_id: r.id,
          message: "dismissed because draft PR marked ready for review"
        });
      });
    }
  });
};

module.exports = autoAssign;
