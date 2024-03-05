import { Octokit } from "octokit";
import { Configuration } from "./types/types";
import sodium from "libsodium-wrappers";
import { OctokitResponse, RequestInterface } from "@octokit/types";

export class RepoManager {
  private app: Octokit;

  constructor(githubAccessToken: string) {
    this.app = new Octokit({ auth: githubAccessToken });
  }

  // Create a variable in your repository.
  // This method is used only for creation, and not update.
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

  // Update a variable in your repository.
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
