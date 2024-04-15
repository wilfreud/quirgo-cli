#!/usr/bin/env node

import { Command } from "commander";
import { RepoManager } from "./lib/repository-manager";
import { Configuration as RepositoryManagerConfiguration } from "@/types/repository-manager";
import { envParser, jsonParser } from "./lib/parsers";
import { BANNER } from "./lib/ui/banner";
import chalk from "chalk";
import { password, select, input } from "@inquirer/prompts";
import {
  createVariableFn,
  removeVariableFn,
  updateVariableFn,
} from "./lib/actions/variables.actions";
import { setSecretFn, removeSecretFn } from "./lib/actions/secrets.actions";

console.log(BANNER);

// Declare the program
const program = new Command();

// Init repo manager
let repoManager: RepoManager | null = null;
const config: RepositoryManagerConfiguration = {
  repositoryName: "",
  repositoryOwner: "",
  verbose: false,
};

// prepare parsing
let parsedKeyValues: ReturnType<typeof envParser> = {};

// Add options
program
  .name("quirgo")
  .option("--verbose", "Verbose output", false)
  .version(
    require("../package.json").version,
    "-v, --version",
    "Output the current version"
  )
  .description(
    "A simple CLI to manage your GitHub repositories secrets and variables."
  )
  .option("-t, --token <string>", "GitHub access token")
  .option("-r, --repo <string>", "GitHub repository name")
  .option("-o, --owner <string>", "GitHub repository owner")
  .option("-e, --env <path>", "Path to a .env file to parse")
  .option("-j, --json <path>", "Path to a JSON file to parse")
  .action((opts) => {
    const { env, token, repo, owner, json } = opts;
    if (token) repoManager = new RepoManager(token);

    if (repo) config.repositoryName = repo;

    if (owner) config.repositoryOwner = owner;

    if (env)
      parsedKeyValues = envParser(env, { verbose: config.verbose || false });
    else if (json)
      parsedKeyValues = jsonParser(opts.json, {
        verbose: config.verbose || false,
      });
  });

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
      console.log("Total:", chalk.green(list?.data.total_count));
      console.table(list?.data.variables);
    } catch (err) {
      console.error(chalk.red(err));
    }
  });
varsCommand
  .command("create [name] [value]")
  .action(async (name, value) => {
    try {
      await fn();
      await createVariableFn(config, repoManager, parsedKeyValues, name, value);
    } catch (err) {
      console.error(chalk.red(err));
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
      console.error(chalk.red(err));
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
      console.error(chalk.red(err));
    }
  });

varsCommand.action(async () => {
  try {
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
        const variables = await repoManager?.listRepoVariables(config);
        console.table(variables?.data.variables);
        console.log(
          chalk.bgGreen("Total: " + variables?.data.total_count + " ")
        );
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
    await fn();
    const secs = await repoManager?.listRepoSecrets(config);
    console.table(secs?.data.secrets);
    console.log(chalk.bgGreen("Total:", secs?.data.total_count));
  });

secretsCommand
  .command("set [name] [value]")
  .description("Set a new secret")
  .action(async (name, value) => {
    try {
      await fn();
      await setSecretFn(config, repoManager, parsedKeyValues, name, value);
    } catch (err) {
      console.error(chalk.red(err));
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
      console.error(chalk.red(err));
    }
  });

secretsCommand.action(async () => {
  try {
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

    await fn();

    switch (actionOption) {
      case "list":
        const variables = await repoManager?.listRepoVariables(config);
        console.table(variables?.data.variables);
        console.log(
          chalk.bgGreen("Total: " + variables?.data.total_count + " ")
        );
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
    console.error(chalk.red(err));
  }
});

// Add subcommands to program
program.addCommand(varsCommand).addCommand(secretsCommand);

// Add hooks & custom events
program.on("option:verbose", () => {
  console.log(chalk.cyan("Verbose mode activated"));
  config.verbose = true;
});

program.on("option:token", (token) => {
  if (!repoManager) repoManager = new RepoManager(token);
});

program.on("option:repo", (repo) => {
  config.repositoryName = repo;
});

program.on("option:owner", (owner) => {
  config.repositoryOwner = owner;
});

program.on("option:env", (env) => {
  parsedKeyValues = envParser(env, { verbose: config.verbose || false });
});

program.on("option:json", (json) => {
  parsedKeyValues = jsonParser(json, { verbose: config.verbose || false });
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

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
