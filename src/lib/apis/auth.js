
// --- browser impl

/*global getAccessToken*/

const setupAuth = () => {
  /**
  When the button's clicked:
  - get an access token using the identity API
  - use it to get the user's info
  - show a notification containing some of it
  getAccessToken()
      .then(getUserInfo)
      .then(createNotify)
      .catch(print.failure);
  */
  browser.identity.getRedirectURL();
}
