import { archiveUnreadEmails } from '../src/background/index';

// Mock fetch API
global.fetch = jest.fn();

describe('Background Script', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock response for fetch
    fetch.mockImplementation((url) => {
      if (url.includes('users/me/messages?q=is:unread')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            messages: [
              { id: 'test_email_1', threadId: 'thread_1' },
              { id: 'test_email_2', threadId: 'thread_2' }
            ]
          })
        });
      }

      if (url.includes('messages/') && url.includes('/modify')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            id: url.split('/').pop().split('?')[0],
            labelIds: ['ARCHIVED']
          })
        });
      }

      return Promise.reject(new Error('Unhandled fetch URL'));
    });
  });

  test('should archive unread emails', async () => {
    const emails = await archiveUnreadEmails();

    // Verify fetch was called correctly
    expect(fetch).toHaveBeenCalledWith('https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread');

    // Verify we got the expected emails back
    expect(emails).toHaveLength(2);
    expect(emails[0].id).toBe('test_email_1');

    // Verify storage was updated
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      archivedEmails: expect.arrayContaining([
        expect.objectContaining({ id: 'test_email_1' })
      ])
    });
  });

  test('should handle API errors gracefully', async () => {
    // Make fetch throw an error
    fetch.mockRejectedValueOnce(new Error('API Error'));

    const emails = await archiveUnreadEmails();

    // Should return mock emails on error
    expect(emails).toEqual([
      { id: "email_1", subject: "Mock Email 1" },
      { id: "email_2", subject: "Mock Email 2" }
    ]);

    // Storage should be updated with mock data (via setTimeout)
    jest.runAllTimers(); // Run the setTimeout
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      archivedEmails: expect.arrayContaining([
        expect.objectContaining({ id: 'email_1' })
      ])
    });
  });
});
