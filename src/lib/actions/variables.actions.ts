import { Configuration } from "@/types/repository-manager";
import { RepoManager } from "../repository-manager";
import { input } from "@inquirer/prompts";
import chalk from "chalk";

/**
 * Create a new variable in the repository.
 * If `name` and `value` are not provided, the function will prompt the user for input.
 * @param config - The configuration object.
 * @param repoManager - An instance of the RepoManager class.
 * @param parsedKeyValues - An object containing parsed key-value pairs.
 * @param name - (Optional) The name of the variable.
 * @param value - (Optional) The value of the variable.
 */
export async function createVariableFn(
  config: Configuration,
  repoManager: RepoManager | null,
  parsedKeyValues: Record<string, string>,
  name?: string,
  value?: string
) {
  if (!name) name = await input({ message: "Variable name: " });
  if (!value) value = await input({ message: "Variable value: " });

  Object.keys(parsedKeyValues).length === 0
    ? await repoManager?.createRepoVariable(config, name, value)
    : Object.keys(parsedKeyValues).map(async (key) => {
        await repoManager?.createRepoVariable(
          config,
          key,
          parsedKeyValues[key] as string
        );
      });

  console.log(chalk.green("🍭 Variable(s) created successfully!"));
}

/**
 * Update an existing variable in the repository.
 * The function will prompt the user for the new name and value of the variable.
 * @param config - The configuration object.
 * @param repoManager - An instance of the RepoManager class.
 * @param name - The name of the variable to update.
 * @param value - The new value of the variable.
 */
export async function updateVariableFn(
  config: Configuration,
  repoManager: RepoManager | null,
  parsedKeyValues: Record<string, string>,
  name?: string,
  value?: string
) {
  if (Object.keys(parsedKeyValues).length > 0) {
    Object.keys(parsedKeyValues).map(async (key) => {
      await repoManager?.updateRepoVariable(
        config,
        key,
        parsedKeyValues[key] as string
      );
    });
  } else {
    if (!name) name = await input({ message: "Variable name: " });
    if (!value) value = await input({ message: "Variable value: " });

    await repoManager?.updateRepoVariable(config, name, value);
  }
  console.log(chalk.green("🍭 Variable(s) updated successfully!"));
}

/**
 * Delete a variable from the repository.
 * The function will prompt the user for the name of the variable to delete.
 * @param config - The configuration object.
 * @param repoManager - An instance of the RepoManager class.
 * @param parsedKeyValues - An object containing parsed key-value pairs.
 * @param name - The name of the variable to delete.
 */
export async function removeVariableFn(
  config: Configuration,
  repoManager: RepoManager | null,
  parsedKeyValues: Record<string, string>,
  name?: string
) {
  if (Object.keys(parsedKeyValues).length > 0) {
    Object.keys(parsedKeyValues).map(async (key) => {
      await repoManager?.removeRepoVariable(config, key);
    });
  } else {
    if (!name) name = await input({ message: "Variable name: " });
    await repoManager?.removeRepoVariable(config, name);
  }
  console.log(chalk.green("🍭 Variable(s) removed successfully!"));
}
