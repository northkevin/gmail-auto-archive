import { createComponentLogger } from '../utils/logger';
const logger = createComponentLogger('MockAPI');

// Mock data for Gmail API responses
export const mockResponses = {
  // Mock response for fetching unread messages
  getMessages: {
    messages: [
      { id: 'mock_email_1', threadId: 'mock_thread_1' },
      { id: 'mock_email_2', threadId: 'mock_thread_2' },
      { id: 'mock_email_3', threadId: 'mock_thread_3' }
    ],
    nextPageToken: null
  },

  // Mock response for modifying a message (archiving)
  modifyMessage: (messageId) => ({
    id: messageId,
    labelIds: ['ARCHIVED'],
    threadId: `thread_${messageId}`
  })
};

/**
 * Sets up a mock fetch implementation that intercepts Gmail API requests
 * and returns mock responses in development mode
 *
 * @returns {Function} A cleanup function to restore the original fetch
 */
export function setupMockFetch() {
  logger.info('Setting up mock fetch handler for development');

  // Store the original fetch function
  const originalFetch = window.fetch;

  // Replace fetch with our mock implementation
  window.fetch = async function(url, options = {}) {
    const urlString = typeof url === 'string' ? url : url.toString();
    logger.debug('Intercepted fetch request', { url: urlString, method: options.method || 'GET' });

    // Match Gmail API endpoints
    if (urlString.includes('gmail.googleapis.com/gmail/v1/users/me/messages')) {
      // Check if this is a modify request (has messageId and ends with /modify)
      const modifyMatch = urlString.match(/messages\/([^\/]+)\/modify/);
      if (modifyMatch && options.method === 'POST') {
        const messageId = modifyMatch[1];
        logger.info('Mocking Gmail API modify request', { messageId });

        // Log the request body if available
        try {
          if (options.body) {
            const body = typeof options.body === 'string'
              ? JSON.parse(options.body)
              : options.body;
            logger.debug('Modify request body', { body });
          }
        } catch (err) {
          logger.warn('Could not parse request body', { error: err });
        }

        // Return mock response for modify
        const mockResponse = mockResponses.modifyMessage(messageId);
        logger.debug('Returning mock modify response', { response: mockResponse });

        return new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      // Handle get messages request
      else if (urlString.includes('?q=is:unread') || urlString.includes('?maxResults=')) {
        logger.info('Mocking Gmail API get messages request');

        // Return mock response for get messages
        logger.debug('Returning mock messages response', {
          messageCount: mockResponses.getMessages.messages.length
        });

        return new Response(JSON.stringify(mockResponses.getMessages), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // For any other requests, pass through to the original fetch
    logger.debug('Passing through non-mocked request', { url: urlString });
    return originalFetch(url, options);
  };

  logger.info('Mock fetch handler installed successfully');

  // Return a cleanup function to restore the original fetch
  return function cleanupMockFetch() {
    window.fetch = originalFetch;
    logger.info('Mock fetch handler removed');
  };
}

// Export a function to check if mocking is active
export function isMockActive() {
  return window.fetch !== globalThis.fetch;
}
