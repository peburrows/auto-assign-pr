const core = require("@actions/core");
const github = require("@actions/github");

const shuffleArray = function(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

let autoAssign = function() {
  console.log("how did I break this...?");
  return new Promise(async (resolve, reject) => {
    console.log("getting the draft approvers list");
    let reviewerList = JSON.parse(core.getInput("draft-approvers"), {
      required: true
    });

    console.log("getting the reviewer count setting");
    let reviewerCount = parseInt(core.getInput("reviewer-count"));
    if (isNaN(reviewerCount)) {
      reviewerCount = 1;
    }

    console.log(
      `reviewer count: ${reviewerCount}, and the input: ${core.getInput(
        "reviewer-count"
      )}`
    );

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

    if (draft && requested_reviewers.length < reviewerCount) {
      console.log(
        "draft PR with less than desired reviewer count, so we will add some"
      );

      let newReviewerCount = reviewerCount - requested_reviewers.length;

      // remove the author from the reviewerList
      reviewerList = reviewerList.filter(r => r !== pr_author);
      let reviewers = [],
        count = 0;

      // grab some random reviewer(s)
      while (count < newReviewerCount) {
        reviewerList = shuffleArray(reviewerList);
        if (reviewers.indexOf(reviewerList[0]) === -1) {
          reviewers.push(reviewerList[0]);
          count++;
        }
      }

      // now request review from the reviewer(s)
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
      let reReviewers = reviews.map(r => r.user.login);
      reReviewers = Array.from(new Set(reReviewers));

      console.log("re-requesting review from ", reReviewers);
      await octokit.pulls.createReviewRequest({
        owner,
        repo,
        pull_number,
        reviewers: reReviewers
      });
    }
  });
};

module.exports = autoAssign;
