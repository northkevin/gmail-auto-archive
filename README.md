# Gmail Auto-Archive Extension

A Chrome extension that automatically archives unread emails in Gmail.

## Features

- Automatically archives unread emails from Gmail
- Simple mock API responses for local development and testing
- Configurable archiving schedule

## Development Setup

### Prerequisites

- Node.js (see .nvmrc for version)
- pnpm package manager

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start development build with watch mode
pnpm start

# Build for development with mocks
pnpm dev-build

# Build for production
pnpm build

# Run tests
pnpm test
```

### Loading the Extension in Chrome

1. Build the extension: `pnpm build` (or `pnpm dev-build` for development with mocks)
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the `dist` directory from this project
5. The extension should now be installed and visible in your browser

## Project Structure

```
gmail-auto-archive/
├── src/                      # Source code
│   ├── background/           # Background scripts
│   │   └── index.js
│   ├── popup/                # Popup UI
│   │   ├── index.html
│   │   └── index.js
│   ├── icons/                # Icons
│   ├── manifest.json         # Extension manifest
│   └── mocks/                # API mocks
│       └── mockApi.js        # Simple fetch interceptor for mocking
├── dist/                     # Build output (for loading unpacked)
├── tests/                    # Test files
├── webpack.config.js         # Webpack configuration
├── jest.config.js            # Jest configuration
└── package.json              # Project configuration
```

## Mocking

The extension uses a simple fetch interceptor for mocking API responses during development. When you build with `pnpm dev-build`, the extension will use mock data instead of making real API calls to Gmail.

The mock implementation:
- Intercepts fetch requests to Gmail API endpoints
- Returns predefined mock responses
- Provides detailed logging for debugging
- Shows a status indicator in the popup

## Testing

This project uses Jest for testing.

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Building for Production

```bash
pnpm build
```

The built extension will be in the `dist` directory, ready to be loaded into Chrome.
