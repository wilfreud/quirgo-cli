#!/usr/bin/dev node

import { Command } from "commander";
import { RepoManager } from "./lib/repository-manager";
import { Configuration as RepositoryManagerConfiguration } from "@/types/repository-manager";
import { envParser, jsonParser } from "./lib/parsers";
import { BANNER } from "./lib/ui/banner";
import chalk from "chalk";

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
let parsedKeyValues: ReturnType<typeof envParser> = {};

/**
 * If no .env file provided,it means only one key-value pair is provided
 * Use console.table() to display listed secrets/variables (consider removing tabler)
 */

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
  .option("-j, --json", "Path to a JSON file to parse")
  .action((opts) => {
    const { env, token, repo, owner, json } = opts;
    if (token) repoManager = new RepoManager(token);

    if (repo) config.repositoryName = repo;

    if (owner) config.repositoryOwner = owner;

    if (env)
      parsedKeyValues = envParser(env, { verbose: config.verbose || false });

    if (json)
      parsedKeyValues = jsonParser(opts.json, {
        verbose: config.verbose || false,
      });
  });

// Add commands
const varsCommand = new Command("vars");
varsCommand.alias("v").description("Manage repository variables");

varsCommand.command("list").description("List all variables");
varsCommand
  .command("create [name] [value]")
  .description("Create a new variable");
varsCommand
  .command("update [name] [value]")
  .description("Update an existing variable");
varsCommand.command("remove [name]").description("Remove an existing variable");

// Add secrets commands
const secretsCommand = new Command("secrets");
secretsCommand.description("Manage repository secrets").alias("s");

secretsCommand
  .command("list")
  .description("List all secrets")
  .action(() => {
    console.log("Listing secrets....");
  });

secretsCommand
  .command("set [name] [value]")
  .description("Set a new secret")
  .action((name, value) => {
    console.log(`Setting secret ${name}.... value: ${value}`);
  });

secretsCommand
  .command("remove [name]")
  .description("Remove an existing secret")
  .action((name) => {
    console.log(`Removing secret ${name}....`);
  });

// Add subcommands to program
program.addCommand(varsCommand).addCommand(secretsCommand);

// Add hooks & custom events
program.on("option:verbose", () => {
  console.log(chalk.cyan("Verbose mode activated"));
  config.verbose = true;
});

program.parse(process.argv);

// Treatment here
const options = program.opts();
console.table(options);
