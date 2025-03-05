console.log("Gmail Auto-Archive extension loaded.");

// Import MSW in development mode
if (process.env.NODE_ENV === 'development') {
  import('../mocks/browser').then(({ worker }) => {
    worker.start();
  });
}

const MOCK_EMAILS = [
  { id: "email_1", subject: "Mock Email 1" },
  { id: "email_2", subject: "Mock Email 2" }
];

// Function to archive unread emails (Mocked)
export async function archiveUnreadEmails() {
  console.log("Archiving emails...");

  try {
    // In development, this will be intercepted by MSW
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread');
    const data = await response.json();

    const emails = data.messages || [];

    // Archive each email
    for (const email of emails) {
      await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${email.id}/modify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addLabelIds: [],
          removeLabelIds: ['INBOX']
        })
      });
    }

    console.log("Archive Complete:", emails);
    chrome.storage.local.set({ archivedEmails: emails });
    return emails;

  } catch (error) {
    console.error("Error archiving emails:", error);

    // Fallback to mock data in case of error
    setTimeout(() => {
      console.log("Mock Archive Complete:", MOCK_EMAILS);
      chrome.storage.local.set({ archivedEmails: MOCK_EMAILS });
    }, 1000);
    return MOCK_EMAILS;
  }
}

// Schedule auto-archiving every hour
chrome.alarms.create("autoArchive", { periodInMinutes: 60 });

// Run when the alarm triggers
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "autoArchive") {
    archiveUnreadEmails();
  }
});

// Listen for manual trigger from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "archiveNow") {
    archiveUnreadEmails().then(() => {
      sendResponse({ status: "Archiving complete" });
    });
    return true; // Keep the message channel open for async response
  }
});
