// background.js

const { webRequest, storage } = browser.extension;
const oauthEndpoint = "https://example.com/oauth/authorize";

const openPopup = () => {
  return new Promise((resolve, reject) => {
    browser.windows.create({
      url: oauthEndpoint,
      type: "popup",
      width: 600,
      height: 400
    }, window => {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError);
      } else {
        resolve(window);
      }
    });
  });
};

const extractAuthCode = details => {
  return new Promise((resolve, reject) => {
    for (let header of details.requestHeaders) {
      if (header.name.toLowerCase() === "authorization") {
        resolve(header.value);
        return;
      }
    }
    reject("Authorization code not found in request headers");
  });
};

const handleAuthRequest = details => {
  return extractAuthCode(details)
    .then(authCode => storage.local.set({ authCode }))
    .catch(error => console.error(`Error extracting auth code: ${error}`));
};

browser.browserAction.onClicked.addListener(() => {
  openPopup()
    .then(window => {
      webRequest.onBeforeRequest.addListener(handleAuthRequest, {
        urls: [oauthEndpoint + "*"],
        windowId: window.id
      }, ["requestHeaders"]);
    })
    .catch(error => console.error(`Error opening popup: ${error}`));
});
