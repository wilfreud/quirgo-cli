import { DotenvParseOutput, parse } from "dotenv";
import { ParserConfig } from "@/types/parser";
import { readFileSync } from "fs";

export function envParser(
  filePath: string,
  config?: ParserConfig
): DotenvParseOutput | undefined {
  try {
    const filecontent = readFileSync(filePath);
    const result = parse(filecontent);
    return result;
  } catch (error) {
    console.error("Error reading csv file. Please make sure file exists");
    if (config?.verbose) console.error(error);
  }
}
