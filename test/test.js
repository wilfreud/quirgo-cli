//import { RepoManager } from "../dist/lib/repository-manager/index.cjs";
// import dataset from "./data/dataset.json" assert { type: "json" };

import {envParser, jsonParser} from "../dist/lib/parsing/parsers.js";

const token = process.env.GITHUB_ACCESS_TOKEN;

if (token === undefined) {
  throw new Error("Can't connect, invalid access token");
}

// const RM = new RepoManager(token);
// const config = {
//   repositoryName: dataset.repo_config.repository_name,
//   repositoryOwner: dataset.repo_config.repository_owner,
//   verbose: true,
// };

// RM.createRepoVariable(
//   config,
//   "DEPLOYMENT_FOLDER_PATH",
//   "/deployments/wommat/api"
// )
//   .then((e) => console.log(e))
//   .catch((err) => console.error(err));

// dataset.secrets_list.forEach((dt) => {
//   RM.setRepoSecret(config, dt.secret_name, dt.secret_value)
//     .then((e) => console.log("Set: ", dt.secret_name))
//     .catch((e) => console.error("failed to set: ", dt.secret_name));
// });

// import { envParser, jsonParser } from "../dist/lib/parsing/parsers.cjs";

const fft = envParser("test/data/parsing.env");
console.log("Env parsing:: ", fft);

const ff = jsonParser("test/data/test.json", {
  verbose: true,
});
console.log("JSON parsing:: ", ff);
