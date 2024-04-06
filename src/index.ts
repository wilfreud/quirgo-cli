#!/usr/bin/dev node

import { Command } from "commander";

// Declare the program
const program = new Command("quirgo");

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
  .option("-V, --verbose", "Verbose output");

// Add commands
program
  .command("vars")
  .description("Manage repository variables")
  .argument("<file>", "Path to a .env file to parse")
  .action((file: string) => {
    console.log(`Processing ${file}...`);
  });

program
  .command("secrets")
  .description("Manage repository secret")
  .argument("<set>", "Create a new secret")
  .argument("<delete>", "Delete a secret");

// Execute CLI with arguments
program.parse(process.argv);

// Treatment here
const options = program.opts();
