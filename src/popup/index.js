import { createComponentLogger } from '../utils/logger';
const logger = createComponentLogger('Popup');

logger.info('Popup initialized');

// Initialize mocks in development mode
if (process.env.NODE_ENV === 'development') {
  logger.debug('Development mode detected, initializing API mocks');

  // Import and initialize mock API
  import('../mocks/mockApi.js')
    .then(({ setupMockFetch }) => {
      // Set up mock fetch and store cleanup function if needed
      const cleanupMockFetch = setupMockFetch();
      // Store cleanup function on window for potential later use
      window.__cleanupMockFetch = cleanupMockFetch;

      // Add mock status indicator
      addMockStatusIndicator();
    })
    .catch(error => {
      logger.error('Failed to initialize API mocks', {
        errorMessage: error.message,
        stack: error.stack
      });
    });
}

document.getElementById("archiveBtn").addEventListener("click", () => {
  logger.info('Archive button clicked');

  chrome.runtime.sendMessage({ action: "archiveNow" }, (response) => {
    if (response) {
      logger.info('Received response from background script', { response });
      document.getElementById("status").innerText = response.status;
    } else {
      const error = chrome.runtime.lastError;
      if (error) {
        logger.warn('Error from background script', { errorMessage: error.message });
        document.getElementById("status").innerText = `Error: ${error.message}`;
      } else {
        logger.warn('No response received from background script');
        document.getElementById("status").innerText = "No response from background script";
      }
    }
  });
});

// Function to add mock status indicator
function addMockStatusIndicator() {
  if (process.env.NODE_ENV !== 'development') return;

  logger.debug('Adding mock status indicator for development mode');

  const mockStatus = document.createElement('div');
  mockStatus.id = 'mock-status';
  mockStatus.style.marginTop = '10px';
  mockStatus.style.padding = '5px';
  mockStatus.style.backgroundColor = '#f0f0f0';
  mockStatus.style.borderRadius = '4px';
  mockStatus.innerText = 'Mock API Status: Checking...';

  document.body.appendChild(mockStatus);

  // Check if mocking is active after a short delay
  setTimeout(() => {
    logger.debug('Checking mock API status');

    try {
      // Make a test request to verify mocking
      const testUrl = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=10';
      logger.debug('Making test request to check mock API status', { url: testUrl });

      fetch(testUrl)
        .then(response => {
          logger.debug('Mock status check response received', {
            status: response.status,
            statusText: response.statusText
          });

          if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          logger.debug('Mock status check data received', {
            dataReceived: JSON.stringify(data).substring(0, 200) + '...'
          });

          // Check if we got mock data
          if (data && data.messages && data.messages.length > 0 &&
              data.messages[0].id.startsWith('mock_')) {
            mockStatus.innerText = 'Mock API Status: Active ✅';
            mockStatus.style.backgroundColor = '#e6ffe6';
            logger.info('Mock API is active - mock data received', {
              messagesCount: data.messages.length,
              firstMessageId: data.messages[0].id
            });
          } else {
            mockStatus.innerText = 'Mock API Status: Inactive ❌';
            mockStatus.style.backgroundColor = '#ffe6e6';
            logger.warn('Mock API may not be active - unexpected data received', {
              dataReceived: JSON.stringify(data)
            });
          }
        })
        .catch(error => {
          mockStatus.innerText = `Mock API Status: Error ❌ (${error.message})`;
          mockStatus.style.backgroundColor = '#ffe6e6';
          logger.error('Error checking mock API status', {
            errorMessage: error.message,
            stack: error.stack
          });
        });
    } catch (error) {
      mockStatus.innerText = `Mock API Status: Exception ❌ (${error.message})`;
      mockStatus.style.backgroundColor = '#ffe6e6';
      logger.error('Exception checking mock API status', {
        errorMessage: error.message,
        stack: error.stack
      });
    }
  }, 1000); // 1 second should be enough for our simple mock
}
