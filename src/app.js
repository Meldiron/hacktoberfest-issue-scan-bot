var GitHub = require("github-api");

require("dotenv").config();

const gh = new GitHub({
 //  username: 'FOO',
 //  password: 'NotFoo'
 token: process.env.GITHUB_TOKEN,
});

const coreTeam = [
 "eldadfux",
 "christyjacob4",
 "TorstenDittmann",
 "lohanidamodar",
 "kodumbeats",
 "abnegate",
 "PineappleIOnic",
 "sarakaandorp",
 "Meldiron",
 "adityaoberai",
];

(async () => {
 const orgNames = ["appwrite", "utopia-php"];
 for (const orgName of orgNames) {
  console.log("Scanning org...", orgName);

  const org = await gh.getOrganization(orgName);
  const repos = (await org.getRepos()).data;

  for (const repo of repos) {
   console.log("Scanning repo...", repo.name);

   const issueObj = gh.getIssues(orgName, repo.name);
   const issues = (
    await issueObj.listIssues({
     state: "open",
     labels: "hacktoberfest",
     since: "2021-01-01",
    })
   ).data;

   for (const issue of issues) {
    const comments = (await issueObj.listIssueComments(issue.number)).data
     .map((comment) => {
      return {
       ...comment,
       created_at: new Date(comment.created_at).getTime(),
      };
     })
     .sort((commentA, commentB) =>
      commentA.created_at < commentB.createdAt ? 1 : -1
     );

    const lastComment = comments[0];

    if (lastComment) {
     const lastCommentAuthor = lastComment.user.login;

     if (!coreTeam.includes(lastCommentAuthor)) {
      console.log("👀 Action required: ", issue.url);
     }
    }
   }
  }
 }
})()
 .then(() => {
  console.log("Finished!");
 })
 .catch((err) => {
  throw err;
 });
