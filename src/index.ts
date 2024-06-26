#!/usr/bin/env node

import { Command, Option } from "commander";
import { RepoManager } from "./lib/repository-manager.js";
import { Configuration as RepositoryManagerConfiguration } from "@/types/repository-manager";
import { envParser, jsonParser } from "./lib/parsers.js";
import { BANNER } from "./lib/ui/banner.js";
import chalk from "chalk";
import { password, select, input } from "@inquirer/prompts";
import {
  createVariableFn,
  removeVariableFn,
  updateVariableFn,
} from "./lib/actions/variables.actions.js";
import { setSecretFn, removeSecretFn } from "./lib/actions/secrets.actions.js";
import { spinner } from "./lib/spinner.js";
import { KeyValueType } from "./types/parsers.js";

console.log(BANNER);

// Declare the program
const program = new Command();

program.configureOutput({
  outputError: (str, write) => write(chalk.red(str)),
});

// Init repo manager
let repoManager: RepoManager | null = null;
const config: RepositoryManagerConfiguration = {
  repositoryName: "",
  repositoryOwner: "",
  verbose: false,
};

// prepare parsing
let parsedKeyValues: KeyValueType = {};

// Add options
program
  .name("quirgo")
  .option("--verbose", "Verbose output", false)
  .description(
    "A simple CLI to manage your GitHub repositories secrets and variables."
  )
  .option("-t, --token <string>", "GitHub access token")
  .option("-r, --repo <string>", "GitHub repository name")
  .option("-o, --owner <string>", "GitHub repository owner")
  .addOption(
    new Option("-e, --env <path>", "Path to a .env file to parse").conflicts(
      "json"
    )
  )
  .addOption(
    new Option("-j, --json <path>", "Path to a JSON file to parse").conflicts(
      "env"
    )
  );

// Add commands
const varsCommand = new Command("vars");
varsCommand.alias("v").description("Manage repository variables");

varsCommand
  .command("list")
  .description("List all variables")
  .action(async () => {
    try {
      await fn();
      const list = await repoManager?.listRepoVariables(config);
      spinner.clear();
      console.table(list?.data.variables);
      console.log(chalk.bgGreen("Total: " + list?.data.total_count + " "));
    } catch (err) {
      if (config.verbose) console.error(err);
      console.error(
        chalk.red("An error occured; please check the repository infos")
      );
    }
  });
varsCommand
  .command("create [name] [value]")
  .action(async (name, value) => {
    try {
      await fn();
      await createVariableFn(config, repoManager, parsedKeyValues, name, value);
    } catch (err) {
      if (config.verbose) console.error(err);
      console.error(
        chalk.red("An error occured; please check the repository infos")
      );
    }
  })
  .description("Create a new variable");

varsCommand
  .command("update [name] [value]")
  .action(async (name, value) => {
    try {
      await fn();
      await updateVariableFn(config, repoManager, parsedKeyValues, name, value);
    } catch (err) {
      if (config.verbose) console.error(err);
      console.error(
        chalk.red("An error occured; please check the repository infos")
      );
    }
  })
  .description("Update an existing variable");
varsCommand
  .command("remove [name]")
  .description("Remove an existing variable")
  .action(async (name) => {
    try {
      await fn();
      await removeVariableFn(config, repoManager, parsedKeyValues, name);
    } catch (err) {
      if (config.verbose) console.error(err);
      console.error(
        chalk.red("An error occured; please check the repository infos")
      );
    }
  });

varsCommand.action(async () => {
  try {
    await fn();
    const actionOption = await select({
      message: "Actions",
      choices: [
        { name: "List all variables", value: "list" },
        { name: "Create a new variable", value: "create" },
        { name: "Update an existing variable", value: "update" },
        { name: "Remove an existing variable", value: "remove" },
      ],
      theme: {
        prefix: "⚙ ",
      },
    });

    await fn();

    switch (actionOption) {
      case "list":
        try {
          const variables = await repoManager?.listRepoVariables(config);
          spinner.clear();
          console.table(variables?.data.variables);
          console.log(
            chalk.bgGreen("Total: " + variables?.data.total_count + " ")
          );
        } catch (err) {
          if (config.verbose) console.error(err);
          console.error(
            chalk.red(
              "An error occured; please check the repository infos (owner & name)"
            )
          );
        }
        break;

      case "create":
        await createVariableFn(config, repoManager, parsedKeyValues);
        break;

      case "update":
        await updateVariableFn(config, repoManager, parsedKeyValues);
        break;

      case "remove":
        await removeVariableFn(config, repoManager, parsedKeyValues);
        break;

      default:
        break;
    }
  } catch (err) {
    if (config.verbose) console.error(err);
    console.error(chalk.red(err));
  }
});

// Add secrets commands
const secretsCommand = new Command("secrets");
secretsCommand.description("Manage repository secrets").alias("s");

secretsCommand
  .command("list")
  .description("List all secrets")
  .action(async () => {
    try {
      await fn();
      const secs = await repoManager?.listRepoSecrets(config);
      spinner.clear();
      console.table(secs?.data.secrets);
      console.log(chalk.bgGreen("Total:", secs?.data.total_count));
    } catch (err) {
      if (config.verbose) console.error(err);
      console.error(
        chalk.red("An error occured; please check the repository infos")
      );
    }
  });

secretsCommand
  .command("set [name] [value]")
  .description("Set a new secret")
  .action(async (name, value) => {
    try {
      await fn();
      await setSecretFn(config, repoManager, parsedKeyValues, name, value);
    } catch (err) {
      if (config.verbose) console.error(err);
      console.error(
        chalk.red("An error occured; please check the repository infos")
      );
    }
  });

secretsCommand
  .command("remove [name]")
  .description("Remove an existing secret")
  .action(async (name) => {
    try {
      await fn();
      await removeSecretFn(config, repoManager, parsedKeyValues, name);
    } catch (err) {
      if (config.verbose) console.error(err);
      console.error(
        chalk.red("An error occured; please check the repository infos")
      );
    }
  });

secretsCommand.action(async () => {
  try {
    await fn();
    const actionOption = await select({
      message: "Actions",
      choices: [
        { name: "List all secrets", value: "list" },
        { name: "Set a  secret", value: "set" },
        { name: "Remove an existing secret", value: "remove" },
      ],
      theme: {
        prefix: "⚙ ",
      },
    });

    switch (actionOption) {
      case "list":
        const secrets = await repoManager?.listRepoSecrets(config);
        spinner.clear();
        console.log(chalk.bgGreen("Total: " + secrets?.data.total_count + " "));
        console.table(secrets?.data.secrets);
        break;

      case "set":
        await setSecretFn(config, repoManager, parsedKeyValues);
        break;

      case "remove":
        await removeSecretFn(config, repoManager, parsedKeyValues);
        break;

      default:
        break;
    }
  } catch (err) {
    if (config.verbose) console.error(err);
    console.error(chalk.red(err));
  }
});
program.hook("postAction", () => {
  spinner.stop().clear();
});

// Add subcommands to program
program.addCommand(varsCommand).addCommand(secretsCommand);

// Add hooks & custom events
program.on("option:verbose", () => {
  console.log(chalk.cyan("Verbose mode activated"));
  config.verbose = true;
});

program.on("option:token", async (token) => {
  if (!repoManager) repoManager = new RepoManager(token);
});

program.on("option:repo", (repo) => {
  config.repositoryName = repo;
});

program.on("option:owner", (owner) => {
  config.repositoryOwner = owner;
});

program.on("option:env", (env) => {
  const verbose: boolean = program.opts().verbose;
  try {
    parsedKeyValues = envParser(env, { verbose });
  } catch (err) {
    console.error(chalk.red(err));
    process.exit(-1);
  }
});

program.on("option:json", (json) => {
  try {
    parsedKeyValues = jsonParser(json, { verbose: config.verbose || false });
  } catch (err) {
    console.error(chalk.red(err));
    process.exit(-1);
  }
});

program.action(() => {
  program.outputHelp();
  process.exit(0);
});

program.parse(process.argv);

/**
 * Function to handle the CLI flow
 */
async function fn() {
  // Ask for token if not provided
  if (!repoManager) {
    const ghToken = await password({
      message: "Enter your GitHub access token: ",
      theme: {
        prefix: "🔑",
      },
      mask: "*",
    });
    repoManager = new RepoManager(ghToken);
  }

  // check auth and set default owner
  try {
    if (!config.repositoryOwner) {
      config.repositoryOwner = (await repoManager.getUserLogin()) || "";
      spinner.stop().clear();

      if (config.verbose) {
        console.log(
          chalk.cyan("-> Using"),
          chalk.bgBlueBright(config.repositoryOwner),
          chalk.cyan("as default repository owner")
        );
      }
    }
  } catch (err: any) {
    console.error(
      chalk.red("Impossible to authenticate using the GitHub Access Token")
    );
    console.error(chalk.red(err));
    process.exit(-1);
  }
  // Ask for repository name if not provided
  if (!config.repositoryName) {
    const repoName = await input({
      message: "Enter the repository name: ",
      theme: {
        prefix: "📦",
      },
    });
    config.repositoryName = repoName;
  }

  // Ask for repository owner if not provided
  if (!config.repositoryOwner) {
    const repoOwner = await input({
      message: "Enter the repository owner: ",
      theme: {
        prefix: "👤",
      },
    });
    config.repositoryOwner = repoOwner;
  }
}
