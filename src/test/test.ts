import { RepoManager } from "..";
import { Configuration } from "../types/types";

const RM = new RepoManager("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");

const config: Configuration = {
  repositoryName: "not-a-portflio",
  repositoryOwner: "wilfreud",
  verbose: true,
};

RM.createRepoVariable(config, "TEST", "VALUE")
  .then((e) => console.log(e))
  .catch((err) => console.error(err));

RM.setRepoSecret(config, "TEST", "VALUE")
  .then((e) => console.log(e))
  .catch((err) => console.error(err));
