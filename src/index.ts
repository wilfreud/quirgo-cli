#!/usr/bin/dev node

import { Command } from "commander";
import { RepoManager } from "./lib/repository-manager";
import { Configuration as RepositoryManagerConfiguration } from "@/types/repository-manager";
import { envParser, jsonParser } from "./lib/parsers";

// Declare the program
const program = new Command("quirgo");

// Init repo manager
let repoManager: RepoManager | null = null;
const config: RepositoryManagerConfiguration = {
  repositoryName: "",
  repositoryOwner: "",
};
let parsedKeyValues: ReturnType<typeof envParser> = {};

/**
 * If no .env file provided,it means only one key-value pair is provided
 * Use console.table() to display listed secrets/variables
 */

// Add options
program
  .version(
    require("../package.json").version,
    "-v, --version",
    "Output the current version"
  )
  .description(
    "A simple CLI to manage your GitHub repositories secrets and variables."
  )
  .option("--verbose", "Verbose output")
  .option("-t, --token <string>", "GitHub access token")
  .action((opts) => {
    if (opts.token) {
      repoManager = new RepoManager(opts.token);
    }
  })
  .option("-r, --repo <string>", "GitHub repository name")
  .action((opts) => {
    if (opts.repo) {
      config.repositoryName = opts.repo;
    }
  })
  .option("-o, --owner <string>", "GitHub repository owner")
  .action((opts) => {
    if (opts.owner) {
      config.repositoryOwner = opts.owner;
    }
  })
  .option("-e, --env <string>", "Path to a .env file to parse")
  .action((opts) => {
    console.log("parsing....");
    if (opts.env) {
      parsedKeyValues = envParser(opts.env);
    }
  })
  .option("-j, --json", "Path to a JSON file to parse")
  .action((opts) => {
    if (opts.json) {
      parsedKeyValues = jsonParser(opts.json);
    }
  });

// Add commands
program
  .command("vars")
  .description("Manage repository variables")
  .alias("v")
  .option("-f, --file <filepath>", "Path to a .env file to parse")
  .command("list", "List all variables")
  .command("create [name] [value]", "Create a new variable")
  .command("update [name] [value]", "Update an existing variable")
  .command("remove [name]", "Remove an existing variable");

program
  .command("secrets")
  .description("Manage repository secrets")
  .alias("s")
  .option("-f, --file <filepath>", "Path to a .env file to parse")
  .command("list", "List all secrets")
  .command("set [name] [value]", "Set a new secret")
  .command("remove [name]", "Remove an existing secret");

// Add hooks & custom events
program.on("option:verbose", () => {
  console.log("Verbose mode activated");
  config.verbose = true;
});

program.on("preAction", () => {
  if (!repoManager) throw new Error("No repository manager found");
});

program.on("*", () => {
  program.help();
});

// Execute CLI with arguments
program.parse();

// Treatment here
const options = program.opts();
// if (program.args.length === 0) {
//   program.help();
// }

console.log("end of program");
// console.log(config);
console.table(options);

config.repositoryName = options.repo || "";
config.repositoryOwner = options.owner || "";
config.verbose = true;
repoManager = new RepoManager(options.token);
parsedKeyValues = envParser(options.env);
for (const key in parsedKeyValues) {
  // console.log(key, program.getOptionValue(key));
  repoManager?.createRepoVariable(config, key, parsedKeyValues[key] || "");
}

/**
 * Next  Step: get input from user
 * Properly understand sub commands
 */
