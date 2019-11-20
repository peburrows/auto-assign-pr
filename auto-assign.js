const core = require("@actions/core");
const github = require("@actions/github");

let autoAssign = function() {
  return new Promise(async (resolve, reject) => {
    // we should remove the current author from this list
    const reviewers = JSON.parse(core.getInput("draft-approvers"), {
      required: true
    });

    const {
      number: pull_number,
      draft,
      requested_reviewers,
      url,
      base
    } = github.context.payload.pull_request;

    const owner = base.repo.owner.login,
      repo = base.repo.name,
      action = github.context.payload.action;

    const token = core.getInput("github-token", { required: true });
    const octokit = new github.GitHub(token);

    if (draft && requested_reviewers.length === 0) {
      console.log("draft PR with no current reviewers, so will add one");

      await octokit.pulls.createReviewRequest({
        owner,
        repo,
        reviewers,
        pull_number
      });
    } else if (action === "ready_for_review") {
      // draft converted to normal PR, so dismiss all reviews
      console.log("a draft PR ready to review");
      const { data: reviews } = await octokit.pulls.listReviews({
        owner,
        repo,
        pull_number
      });

      console.log("my reviews:", reviews);
      reviews.forEach(async r => {
        console.log("dismissing review from ", r.user.login);
        await octokit.pulls.dismissReview({
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
