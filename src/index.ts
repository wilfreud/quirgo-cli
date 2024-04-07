#!/usr/bin/dev node

import { Command } from "commander";

// Declare the program
const program = new Command("quirgo");

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
  .option("-t, --token <token>", "GitHub access token");

// Add commands
program
  .command("vars")
  .description("Manage repository variables")
  // .argument("<action>", "create, udpate or remove a variable")
  .alias("v")
  .option("-f, --file <filepath>", "Path to a .env file to parse")
  .command("list", "List all variables")
  .command("create <key> <value>", "Create a new variable")
  .command("update <key <value>", "Update an existing variable")
  .command("remove <key>", "Remove an existing variable");

program
  .command("secrets")
  .description("Manage repository secrets")
  .alias("s")
  .option("-f, --file <filepath>", "Path to a .env file to parse")
  .command("list", "List all secrets")
  .command("set <key> <value>", "Set a new secret")
  .command("remove <key>", "Remove an existing secret");

// Execute CLI with arguments
program.parse(process.argv);

// Treatment here
const options = program.opts();
console.table(options);
