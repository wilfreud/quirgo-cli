// import * as commander from 'commander'
import { Command } from "commander";

const bootstrap = async () => {
  const program = new Command();

  program
    .version(
      require("@/../package.json").version,
      "-v, --version",
      "Output the current version"
    )
    .usage("<command> [options]")
    .helpOption("-h, --help", "Output usage informations");

  await program.parseAsync(process.argv);

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
};

bootstrap();
