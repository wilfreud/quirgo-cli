/**
 * Configuration object for GitHub repository settings.
 */
export type Configuration = {
  /**
   * Enables logging for every major step.
   * @default false
   */
  verbose?: boolean;
  /**
   * The name of your GitHub repository.
   */
  repositoryName: string;
  /**
   * The name of the repository's owner.
   * In case it is owned by an organization, then set this to the organization's name.
   */
  repositoryOwner: string;
};
