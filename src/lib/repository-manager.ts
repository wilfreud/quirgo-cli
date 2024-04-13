import { Octokit } from "octokit";
import { Configuration } from "@/types/repository-manager";
import sodium from "libsodium-wrappers";
import { OctokitResponse } from "@octokit/types";

/**
 * TODO: REFACTOR -> rwrite methods with rest requests
 * Faster & shorter
 * Tag commit as "refactor"
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

  // Create/Update a repository secret
  /**
   * Create or update a secret in the repository for GitHub Actions.
   * This method is used only for creation, not for updating existing variables.
   * @param {Configuration} config The configuration object containing repository details.
   * @param {string} secretName The name of the variable to create.
   * @param {string} secreteValue The value of the variable to create.
   * @returns {Promise<void | OctokitResponse<any>>} A Promise containing the Octokit response.
   */
  public async setRepoSecret(
    config: Configuration,
    secretName: string,
    secreteValue: string
  ): Promise<void | OctokitResponse<any>> {
    return this.app
      .request("GET /repos/{owner}/{repo}/actions/secrets/public-key", {
        // request repository's public key
        owner: config.repositoryOwner,
        repo: config.repositoryName,
      })
      .then((publicKeyInfos) => {
        const { key, key_id } = publicKeyInfos.data;

        // encrypt secret
        sodium.ready
          .then(() => {
            // Convert the secret and key to a Uint8Array.
            let binkey = sodium.from_base64(
              key,
              sodium.base64_variants.ORIGINAL
            );
            let binsec = sodium.from_string(secreteValue);

            // Encrypt the secret using libsodium
            let encBytes = sodium.crypto_box_seal(binsec, binkey);

            // Convert the encrypted Uint8Array to Base64
            let output = sodium.to_base64(
              encBytes,
              sodium.base64_variants.ORIGINAL
            );

            // Print the output
            return output;
          })
          .then((encryptedValue: string) => {
            // Set secret it repository
            this.app.request(
              "PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}",
              {
                owner: config.repositoryOwner,
                repo: config.repositoryName,
                secret_name: secretName,
                encrypted_value: encryptedValue,
                key_id: key_id,
              }
            );
          });
      });
  }
}
