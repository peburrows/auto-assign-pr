const core = require("@actions/core");
const github = require("@actions/github");
const shuffleArray = require("./shuffle");

const autoAssign = function () {
  return new Promise(async (resolve, reject) => {
    // CONFIG
    const reviewerList = JSON.parse(core.getInput("draft-approvers"), {
      required: true,
    });

    const onlyDrafts = core.getInput("only-drafts") == "false" ? false : true;

    let reviewerCount = parseInt(core.getInput("reviewer-count"));
    if (isNaN(reviewerCount)) {
      reviewerCount = 1;
    }

    const {
      number: pull_number,
      draft,
      requested_reviewers,
      base,
      user: { login: author },
    } = github.context.payload.pull_request;

    const owner = base.repo.owner.login,
      repo = base.repo.name,
      action = github.context.payload.action;

    const token = core.getInput("github-token", { required: true });
    const octokit = new github.GitHub(token);

    // first, if this PR has just been converted from a draft PR,
    // dismiss all reviews already submitted
    if (action === "ready_for_review") {
      const { data: reviews } = await octokit.pulls.listReviews({
        owner,
        repo,
        pull_number,
      });

      let reReviewers = new Set();
      reviews.forEach(async ({ state, id, user: { login } }) => {
        if (state === "APPROVED") {
          reReviewers.add(login);
          await octokit.pulls.dismissReview({
            owner,
            repo,
            pull_number,
            review_id: id,
            message: "dismissed because draft PR marked ready for review",
          });
        }
      });

      reReviewers = Array.from(reReviewers);
      console.log("re-requesting review from:", reReviewers);
      await octokit.pulls.createReviewRequest({
        owner,
        repo,
        pull_number,
        reviewers: reReviewers,
      });
    } else {
      const shouldCheckReviewers = (onlyDrafts && draft) || !onlyDrafts;
      if (shouldCheckReviewers && requested_reviewers.length < reviewerCount) {
        console.log(
          `PR with fewer than desired reviewer count (${requested_reviewers.length}/${reviewerCount})`
        );

        const reviewersToAdd = reviewerCount - requested_reviewers.length;
        // remove the PR author from the potential reviewers
        reviewerList = reviewerList.filter((r) => r !== author);
        if (reviewersToAdd < reviewerList.length) {
          return core.setFailed(
            "You requested more reviewers than you provided in the approver list"
          );
        }

        let reviewers = [];
        while (reviewers.length < reviewersToAdd) {
          let candidate = shuffleArray(reviewerList)[0];
          if (reviewers.indexOf(candidate) === -1) {
            reviewers.push(candidate);
          }
        }

        await octokit.pulls.createReviewRequest({
          owner,
          repo,
          reviewers,
          pull_number,
        });
      }
    }
  });
};

module.exports = autoAssign;
