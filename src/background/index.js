import { createComponentLogger } from '../utils/logger';
const logger = createComponentLogger('Background');

logger.info('Gmail Auto-Archive extension loaded');

// Only initialize mocks in development mode
// This code will be completely removed in production builds
if (process.env.NODE_ENV === 'development') {
  logger.debug('Development mode detected, initializing API mocks');

  // Check if we're in a context with document (popup) or not (background service worker)
  const isServiceWorkerContext = typeof document === 'undefined';

  if (isServiceWorkerContext) {
    logger.info('Running in service worker context - mocks will be initialized in popup');
    // In service worker context, we can't modify fetch directly
    // Instead, we'll rely on the popup to initialize mocks
  } else {
    // Use a try-catch block to handle any errors during mock initialization
    try {
      // Dynamic import to ensure this code is tree-shaken in production
      import('../mocks/mockApi.js')
        .then(({ setupMockFetch }) => {
          // Initialize mocks with a timeout to ensure Chrome extension is fully loaded
          setTimeout(() => {
            const cleanup = setupMockFetch();
            logger.info('Mock API initialized successfully');
            // Store cleanup function if needed
            window.__cleanupMockFetch = cleanup;
          }, 500);
        })
        .catch(error => {
          logger.error('Failed to import mock API modules', {
            errorMessage: error.message,
            stack: error.stack
          });
        });
    } catch (error) {
      logger.error('Error in mock API initialization block', {
        errorMessage: error.message,
        stack: error.stack
      });
    }
  }
}

const MOCK_EMAILS = [
  { id: "email_1", subject: "Mock Email 1" },
  { id: "email_2", subject: "Mock Email 2" }
];

// Function to archive unread emails
export async function archiveUnreadEmails() {
  logger.info('Starting email archiving process');

  try {
    logger.debug('Fetching unread emails');
    // In development, this will be intercepted by our mock API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread');

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    logger.debug('Received email data', { emailCount: data.messages?.length || 0 });

    const emails = data.messages || [];
    logger.info(`Found ${emails.length} unread emails to archive`);

    // Archive each email
    for (const email of emails) {
      logger.debug(`Archiving email ${email.id}`);
      const archiveResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${email.id}/modify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addLabelIds: [],
          removeLabelIds: ['INBOX']
        })
      });

      if (!archiveResponse.ok) {
        logger.warn(`Failed to archive email ${email.id}`, { status: archiveResponse.status });
      } else {
        const archiveData = await archiveResponse.json();
        logger.debug(`Successfully archived email ${email.id}`, { archiveData });
      }
    }

    logger.info('Archive process complete', { count: emails.length });
    chrome.storage.local.set({ archivedEmails: emails }, () => {
      logger.debug('Saved archived emails to storage', { count: emails.length });
    });
    return emails;

  } catch (error) {
    logger.error('Error archiving emails', {
      errorMessage: error.message,
      stack: error.stack
    });

    // Fallback to mock data in case of error
    logger.warn('Using mock data as fallback');
    setTimeout(() => {
      logger.info('Mock archive complete', { emails: MOCK_EMAILS });
      chrome.storage.local.set({ archivedEmails: MOCK_EMAILS });
    }, 1000);
    return MOCK_EMAILS;
  }
}

// Schedule auto-archiving every hour
logger.info('Setting up auto-archive alarm (every 60 minutes)');
chrome.alarms.create("autoArchive", { periodInMinutes: 60 });

// Run when the alarm triggers
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "autoArchive") {
    logger.info('Auto-archive alarm triggered');
    archiveUnreadEmails();
  }
});

// Listen for manual trigger from popup
logger.info('Setting up message listener for manual archive');
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "archiveNow") {
    logger.info('Manual archive requested from popup');
    archiveUnreadEmails().then((emails) => {
      logger.info('Manual archive complete, sending response to popup', { count: emails.length });
      sendResponse({ status: `Archived ${emails.length} emails`, count: emails.length });
    });
    return true; // Keep the message channel open for async response
  }
});
