document.getElementById("archiveBtn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "archiveNow" }, (response) => {
      document.getElementById("status").innerText = response.status;
    });
  });
