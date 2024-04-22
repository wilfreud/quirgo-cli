import { DotenvParseOutput, parse } from "dotenv";
import { KeyValueType, ParserConfig } from "@/types/parsers";
import { readFileSync } from "fs";

/**
 * Parses the contents of a .env file and returns an object containing the environment variables.
 * @param {string} filePath - The path to the .env file to parse.
 * @param {ParserConfig} [config] - Configuration options for parsing.
 * @param {boolean} [config.verbose=false] - If true, verbose error messages will be logged.
 * @returns {DotenvParseOutput} An object containing the parsed environment variables.
 */
export function envParser(
  filePath: string,
  config?: ParserConfig
): DotenvParseOutput {
  let result: DotenvParseOutput = {};
  try {
    const filecontent = readFileSync(filePath);
    result = parse(filecontent);
  } catch (error) {
    if (config?.verbose) console.error(error);
    throw new Error(
      "Error reading JSON file. Please ensure the file exists and is valid."
    );
  }
  return result;
}

/**
 * Parses the contents of a JSON file and returns an object containing the parsed data.
 * @param {string} filepath - The path to the JSON file to parse.
 * @param {ParserConfig} [config] - Configuration options for parsing.
 * @param {boolean} [config.verbose=false] - If true, verbose error messages will be logged.
 * @returns {KeyValueType} An object containing the parsed data from the JSON file.
 */
export function jsonParser(
  filepath: string,
  config?: ParserConfig
): KeyValueType {
  let obj: KeyValueType = {};
  try {
    const file = readFileSync(filepath, "utf-8");
    const fileContent: KeyValueType = JSON.parse(file);
    const doesTypeMatch = Object.values(fileContent).every(
      (value: any) => typeof value === "string"
    );
    if (!doesTypeMatch)
      throw new Error(
        "Invalid shape of json file. Please refer to the documentation for more details"
      );

    obj = fileContent;
  } catch (err) {
    if (config?.verbose) console.error(err);
    throw new Error(
      "Error reading JSON file. Please ensure the file exists and is valid."
    );
  }

  return obj;
}
