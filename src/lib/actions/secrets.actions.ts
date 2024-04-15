import { Configuration } from "@/types/repository-manager";
import { RepoManager } from "../repository-manager";
import { input } from "@inquirer/prompts";
import chalk from "chalk";

/**
 * Create a new secret in the repository.
 * If `name` and `value` are not provided, the function will prompt the user for input.
 * @param config - The configuration object.
 * @param repoManager - An instance of the RepoManager class.
 * @param parsedKeyValues - An object containing parsed key-value pairs.
 * @param name - (Optional) The name of the secret.
 * @param value - (Optional) The value of the secret.
 */
export async function setSecretFn(
  config: Configuration,
  repoManager: RepoManager | null,
  parsedKeyValues: Record<string, string>,
  name?: string,
  value?: string
) {
  if (Object.keys(parsedKeyValues).length === 0) {
    if (!name) name = await input({ message: "Secret name: " });
    if (!value) value = await input({ message: "Secret value: " });
    await repoManager?.setRepoSecret(config, name, value);
  } else {
    Object.keys(parsedKeyValues).map(async (key) => {
      await repoManager?.setRepoSecret(
        config,
        key,
        parsedKeyValues[key] as string
      );
    });
  }
  console.log(chalk.green("🍭 Secret(s) set successfully!"));
}

/**
 * Delete a secret from the repository.
 * The function will prompt the user for the name of the secret to delete.
 * @param config - The configuration object.
 * @param repoManager - An instance of the RepoManager class.
 * @param name - The name of the secret to delete.
 */
export async function removeSecretFn(
  config: Configuration,
  repoManager: RepoManager | null,
  parsedKeyValues: Record<string, string>,
  name?: string
) {
  if (Object.keys(parsedKeyValues).length > 0) {
    Object.keys(parsedKeyValues).map(async (key) => {
      await repoManager?.removeRepoSecret(config, key);
    });
  } else {
    if (!name) name = await input({ message: "Secret name: " });
    await repoManager?.removeRepoSecret(config, name);
    console.log(chalk.green("🍭 Secret(s) removed successfully!"));
  }
}
