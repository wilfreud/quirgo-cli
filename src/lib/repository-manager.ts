import { Octokit } from "octokit";
import { Configuration } from "@/types/repository-manager";
import sodium from "libsodium-wrappers";
import { OctokitResponse } from "@octokit/types";
import { spinner } from "./spinner.js";

/**
 * TODO: REFACTOR -> rwrite methods with rest requests
 * Faster & shorter
 * Tag commit as "refactor"
 * TODO: check returnTypes
 */

export class RepoManager {
  private app: Octokit;

  constructor(githubAccessToken: string) {
    this.app = new Octokit({ auth: githubAccessToken });
  }

  /**
   * List variables in the repository for GitHub Actions.
   * @param {Configuration} config The configuration object containing repository details.
   * @returns {Promise<OctokitResponse<ReturnType<typeof this.app.rest.actions.listRepoVariables>>>} A Promise containing the Octokit response.
   */
  public async listRepoVariables(
    config: Configuration
  ): Promise<ReturnType<typeof this.app.rest.actions.listRepoVariables>> {
    spinner.start("Fetching repository variables...\n");
    return await this.app.rest.actions.listRepoVariables({
      owner: config.repositoryOwner,
      repo: config.repositoryName,
    });
  }

  /**
   * Create a variable in the repository for GitHub Actions.
   * This method is used only for creation, not for updating existing variables.
   *
   * @param {Configuration} config The configuration object containing repository details.
   * @param {string} variableName The name of the variable to create.
   * @param {string} variableValue The value of the variable to create.
   * @returns {Promise<OctokitResponse<any>>} A Promise containing the Octokit response.
   */
  public async createRepoVariable(
    config: Configuration,
    variableName: string,
    variableValue: string
  ): Promise<OctokitResponse<any>> {
    spinner.start(`Creating variable <${variableName}>...\n`);
    return await this.app.request(
      "POST /repos/{owner}/{repo}/actions/variables",
      {
        owner: config.repositoryOwner,
        repo: config.repositoryName,
        name: variableName,
        value: variableValue,
      }
    );
  }

  /**
   * Update a variable in the repository for GitHub Actions.
   * This method is used only for creation, not for updating existing variables.
   *
   * @param {Configuration} config The configuration object containing repository details.
   * @param {string} variableName The name of the variable to create.
   * @param {string} variableValue The value of the variable to create.
   * @returns {Promise<OctokitResponse<any>>} A Promise containing the Octokit response.
   */
  public async updateRepoVariable(
    config: Configuration,
    variableName: string,
    variableValue: string
  ): Promise<OctokitResponse<any>> {
    spinner.start(`Updating variable <${variableName}>...\n`);
    return await this.app.request(
      "PATCH /repos/{owner}/{repo}/actions/variables/{name}",
      {
        owner: config.repositoryOwner,
        repo: config.repositoryName,
        name: variableName,
        value: variableValue,
      }
    );
  }

  /**
   * Remove a variable in the repository for GitHub Actions.
   * @param {Configuration} config The configuration object containing repository details.
   * @param {string} variableName The name of the variable to remove.
   * @returns {Promise<OctokitResponse<any>>} A Promise containing the Octokit response.
   */
  public async removeRepoVariable(
    config: Configuration,
    variableName: string
  ): Promise<OctokitResponse<any>> {
    spinner.start(`Removing variable <${variableName}>...\n`);
    return await this.app.rest.actions.deleteRepoVariable({
      owner: config.repositoryOwner,
      repo: config.repositoryName,
      name: variableName,
    });
  }

  /**
   * Retrieves a list of secrets for a repository.
   *
   * @param config - The configuration object containing repository owner and name.
   * @returns A promise that resolves to the list of repository secrets.
   */
  public async listRepoSecrets(
    config: Configuration
  ): Promise<ReturnType<typeof this.app.rest.actions.listRepoSecrets>> {
    spinner.start("Fetching repository secrets...\n");
    return await this.app.rest.actions.listRepoSecrets({
      owner: config.repositoryOwner,
      repo: config.repositoryName,
    });
  }

  /**
   * Create or update a secret in the repository for GitHub Actions.
   * This method is used only for creation, not for updating existing variables.
   * @param {Configuration} config The configuration object containing repository details.
   * @param {string} secretName The name of the variable to create.
   * @param {string} secretValue The value of the variable to create.
   * @returns {Promise<void | OctokitResponse<any>>} A Promise containing the Octokit response.
   */
  public async setRepoSecret(
    config: Configuration,
    secretName: string,
    secretValue: string
  ): Promise<void | OctokitResponse<any>> {
    spinner.start(`Setting secret <${secretName}>...\n`);
    // get repo public key
    const encryptedValue = await this.app.rest.actions.getRepoPublicKey({
      owner: config.repositoryOwner,
      repo: config.repositoryName,
    });

    // wait for sodium to be ready
    await sodium.ready;

    // enncrypt secret

    const { key, key_id } = encryptedValue.data;
    const binkey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
    const binsec = sodium.from_string(secretValue);

    // Encrypt the secret using libsodium
    const encBytes = sodium.crypto_box_seal(binsec, binkey);

    // Convert the encrypted Uint8Array to Base64
    const encryptedOutput = sodium.to_base64(
      encBytes,
      sodium.base64_variants.ORIGINAL
    );

    // set secret
    return this.app.rest.actions.createOrUpdateRepoSecret({
      owner: config.repositoryOwner,
      repo: config.repositoryName,
      secret_name: secretName,
      encrypted_value: encryptedOutput,
      key_id,
    });
  }

  /**
   * Removes a repository secret.
   *
   * @param config - The configuration object containing repository owner and name.
   * @param secretName - The name of the secret to be removed.
   * @returns A promise that resolves to the Octokit response.
   */
  public async removeRepoSecret(
    config: Configuration,
    secretName: string
  ): Promise<OctokitResponse<any>> {
    spinner.start(`Removing secret <${secretName}>...\n`);
    return await this.app.rest.actions.deleteRepoSecret({
      owner: config.repositoryOwner,
      repo: config.repositoryName,
      secret_name: secretName,
    });
  }
}
