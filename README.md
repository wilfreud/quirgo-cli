# Quirgo CLI

Quirgo is a tool built to easily configure repositories' secrets and variables.

## Installation

```
yarn add -g quirgo-cli
```

or

```
pnpm add -g quirgo-cli
```

or

```
npm install -g quirgo-cli
```

## Usage

To start using Quirgo, run:

```
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

```ps1
quirgo secrets set --token=xxxxxxxxx --repo=repository --owner=owner --env=/path/to/env/file
```

### File parsing

It is possible to load variables/secrets from .env and .json files, as long as the key-value format is respected.

The .json file would need to resect this format:

```json
{
  "KEY_1": "VALUE_1",
  "KEY_2": "VALUE_2"
}
```

## License

Quirgo is [MIT licensed](LICENSE).
