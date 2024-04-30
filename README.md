# Quirgo CLI

Quirgo is a command line interface tool built to easily configure repository secrets and variables. It assists in the process of automating application deployment with features such as batch sets of secrets/variables by providing an easy way to perform CRUD (Create | Read | Update | Delete) operations on them.

## Installation

Install Quirgo globally by running:

```sh
yarn add -g quirgo
```

or

```sh
pnpm add -g quirgo
```

or

```sh
npm install -g quirgo
```

## Usage

To start using Quirgo, run:

```sh
quirgo
```

### Commands

- vars
  - list
  - create
  - update
  - remove
- secrets
  - list
  - set
  - remove

### Example

The following example shows how to set a list of secrets loaded from a .env file in one command:

```sh
quirgo secrets set --token=xxxxxxxxx --repo=repository --owner=owner --env=/path/to/env/file
```

### File parsing

It is possible to load variables/secrets from .env and .json files, as long as the key-value format is respected.
The json file look like this:

```json
{ "KEY": "VALUE" }
```

### Notes

To run Quirgo requires at least the following permissions

- Read/write access to repository secrets and variables
- Read access to user information (specifically the user's username).

For more information about the profile information Quirgo has access to, see the official [GitHub API documentation](https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-the-authenticated-user).

Quirgo uses the public Github API under the hood, so you will need a [Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) (--token) to perform any action. If you'd like to define specific permissions for a P.A.T., read [this](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token).

## License

Quirgo is [MIT licensed](LICENSE).
