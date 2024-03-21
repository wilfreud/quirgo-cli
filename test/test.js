// import { RepoManager } from "../dist/index.cjs";

// const token = process.env.GITHUB_ACCESS_TOKEN;

// if (token === undefined) {
//   throw new Error("Can't connect, invalid access token");
// }

// const RM = new RepoManager(token);
// const config = {
//   repositoryName: "not-a-portfolio",
//   repositoryOwner: "wilfreud",
//   verbose: true,
// };

// RM.createRepoVariable(config, "TEST", "VALUE")
//   .then((e) => console.log(e))
//   .catch((err) => console.error(err));

// RM.setRepoSecret(config, "TEST", "VALUE")
//   .then((e) => console.log(e))
//   .catch((err) => console.error(err));

import { envParser, jsonParser } from "../dist/lib/parsing/parsers.cjs";

const fft = envParser("test/data/parsing.env");
console.log("Env parsing:: ", fft);

const ff = jsonParser("test/data/test.json", {
  verbose: true,
});
console.log("JSON parsing:: ", ff);
