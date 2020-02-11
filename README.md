# Idena Desktop

> Idena Desktop client for Windows, Mac, and Linux.

Backed by [Electron](https://www.electronjs.org), [React](https://reactjs.org) and [Next.js](https://nextjs.org/).

[![Build Status](https://travis-ci.com/idena-network/idena-desktop.svg?branch=master)](https://travis-ci.com/idena-network/idena-desktop)

## Getting started

### Download latest release

https://github.com/idena-network/idena-desktop/releases/latest

### Install

Follow installation instructions for your system.

### Get to know Idena

Visit [Idena](https://idena.io) for the [most common questions](https://idena.io/?view=faq) and [guidelines](https://idena.io/?view=guide).

### Configuration

Most of the configuration is available in `userData` directory:

- `%APPDATA%\Idena` on Windows
- `~/Library/Application Support/Idena` on macOS
- `~/.config/Idena` on Linux

**Note**: Manual configuration is a danger zone that may corrupt your Idena installation and lead to unexpected behavior. Only edit configuration files if you're 💯sure what you do.

### Logs

Logs are available in `logs` directory:

- `%APPDATA%\Idena\logs` on Windows
- `~/Library/Logs/Idena` on macOS
- `~/.config/Idena/idena.log` on Linux

### Built-in node

Node configuration and data files located in `node` directory inside `userData`:

- `%APPDATA%\Idena\node` on Windows
- `~/Library/Application Support/Idena/node` on macOS
- `~/.config/Idena/node` on Linux

The built-in node directory structure is the same as for standalone node.

## Development

### Prerequisites

- [Node.js](https://nodejs.org) 10.x or later LTS versions recommended
- npm 6.x or later recommended
- Git

### Install dependencies

```bash
npm install
```

### Run

```
npm start
```

### Build

Builds available for macOS, Windows and Linux platforms thanks to [electron-builder](https://www.electron.build/).

You may build for the current platform:

```
npm run dist
```

or for a specific platform

```
npm run dist:win
npm run dist:mac
npm run dist:linux
```

Currently, only `deb` target supported for Linux.

PRs are welcome! 👐

## Contributing

TBD
