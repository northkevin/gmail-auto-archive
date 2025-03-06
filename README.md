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
- Chrome, Arc, or other Chromium-based browser

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

# Start webpack dev server (faster rebuilds)
pnpm dev-server

# Auto-reload extension in Chrome (requires extension ID)
pnpm reload <extension-id> [browser-name]

# Run dev server and auto-reload together for Chrome
pnpm dev <extension-id>

# Run dev server and auto-reload together for Arc
pnpm dev:arc <extension-id> Arc
```

### Using the Dev Server

For the best development experience:

1. First, build and load your extension in your browser: `pnpm dev-build`
2. Get your extension ID from the browser's extension page:
   - Chrome: `chrome://extensions`
   - Arc: `arc://extensions`
3. Run the dev server with auto-reload:
   - For Chrome: `pnpm dev your-extension-id`
   - For Arc: `pnpm dev:arc your-extension-id Arc`
4. Make changes to your code - the extension will automatically rebuild and reload!

### Important Notes on Chrome Extension Development

Chrome extensions have strict Content Security Policy (CSP) restrictions that prevent loading scripts from external sources like `localhost`. Our setup handles this by:

1. Writing all webpack output directly to the `dist` directory
2. Disabling hot module replacement (which would require external script loading)
3. Using the auto-reload script to refresh the extension when files change

This approach ensures compatibility with Chrome's security model while still providing a good development experience.

### Loading the Extension in Chrome or Arc

1. Build the extension: `pnpm build` (or `pnpm dev-build` for development with mocks)
2. Open your browser and navigate to the extensions page:
   - Chrome: `chrome://extensions/`
   - Arc: `arc://extensions/`
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
├── scripts/                  # Helper scripts
│   └── reload-extension.js   # Auto-reload extension in Chrome/Arc
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

The built extension will be in the `dist` directory, ready to be loaded into Chrome or Arc.
