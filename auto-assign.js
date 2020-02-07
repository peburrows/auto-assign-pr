const core = require("@actions/core");
const github = require("@actions/github");

let autoAssign = function() {
  return new Promise(async (resolve, reject) => {
    // we should remove the current author from this list
    let reviewerList = JSON.parse(core.getInput("draft-approvers"), {
      required: true
    });

    const {
      number: pull_number,
      draft,
      requested_reviewers,
      url,
      base,
      user: { login: pr_author }
    } = github.context.payload.pull_request;

    const owner = base.repo.owner.login,
      repo = base.repo.name,
      action = github.context.payload.action;

    const token = core.getInput("github-token", { required: true });
    const octokit = new github.GitHub(token);

    if (draft && requested_reviewers.length === 0) {
      console.log("draft PR with no current reviewers, so will add one");

      // remove the author from the reviewerList
      reviewerList = reviewerList.filter(r => r !== pr_author);
      const i = Math.floor(Math.random() * reviewerList.length);
      const reviewers = [reviewerList[i]];

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

      reviews.forEach(async r => {
        if (r.state === "APPROVED") {
          console.log("dismissing review from ", r.user.login);
          await octokit.pulls.dismissReview({
            owner,
            repo,
            pull_number,
            review_id: r.id,
            message: "dismissed because draft PR marked ready for review"
          });
        }
      });

      // build a list of unique reviewers
      let reviewers = reviews.map(r => r.user.login);
      reviewers = Array.from(new Set(reviewers));

      console.log("re-requesting review from ", reviewers);
      await octokit.pulls.createReviewRequest({
        owner,
        repo,
        pull_number,
        reviewers: [reviewers]
      });
    }
  });
};

module.exports = autoAssign;
