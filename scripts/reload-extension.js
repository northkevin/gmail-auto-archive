// This script watches for changes and reloads the Chrome extension
const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the extension ID from the command line arguments
const extensionId = process.argv[2];
// Get the browser name (defaults to 'Google Chrome')
const browserName = process.argv[3] || 'Google Chrome';

if (!extensionId) {
  console.error('Please provide your extension ID as an argument:');
  console.error('node scripts/reload-extension.js <extension-id> [browser-name]');
  console.error('Examples:');
  console.error('  node scripts/reload-extension.js abcdefgh Google Chrome');
  console.error('  node scripts/reload-extension.js abcdefgh Arc');
  console.error('You can find your extension ID in the browser\'s extensions page with Developer mode enabled');
  process.exit(1);
}

// Path to the dist directory
const distDir = path.join(__dirname, '../dist');

// Create the dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Function to reload the extension
function reloadExtension() {
  console.log('Changes detected, reloading extension...');

  // For Mac with specified browser
  const command = `osascript -e 'tell application "${browserName}" to tell its first window to reload extension "${extensionId}"'`;

  // For Windows, you would use something like:
  // const command = `chrome-extension-cli reload ${extensionId}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error reloading extension: ${error.message}`);
      console.error(`You may need to reload the extension manually in ${browserName}'s extensions page`);
      return;
    }
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }
    console.log('Extension reloaded successfully!');
  });
}

// Watch for changes in the dist directory
const watcher = chokidar.watch(distDir, {
  ignored: /(^|[\/\\])\../, // Ignore dotfiles
  persistent: true,
  ignoreInitial: true,
});

console.log(`Watching for changes in ${distDir}...`);
console.log(`Extension ID: ${extensionId}`);
console.log(`Browser: ${browserName}`);

// Add event listeners
watcher
  .on('add', path => {
    console.log(`File ${path} has been added`);
    reloadExtension();
  })
  .on('change', path => {
    console.log(`File ${path} has been changed`);
    reloadExtension();
  })
  .on('unlink', path => {
    console.log(`File ${path} has been removed`);
    reloadExtension();
  });

console.log('Watcher started. Press Ctrl+C to stop.');
