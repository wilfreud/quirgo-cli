// Octokit requests shape
export type Configuration = {
  // Enables logging for every major step
  verbose?: boolean;
  // The name of your github repo
  repositoryName: string;
  // The name of the repo's owner.
  // In case it is owned by an organization, then set this to the organization's name
  repositoryOwner: string;
};
