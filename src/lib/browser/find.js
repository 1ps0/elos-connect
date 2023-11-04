function found(results) {
  console.log(`There were: ${results.count} matches.`);
  if (results.count > 0) {
    browser.find.highlightResults();
  }
}
// browser.find.find("banana").then(found);

async function findInAllTabs(allTabs) {
  for (let tab of allTabs) {
    let results = await browser.find.find('banana', { tabId: tab.id });
    console.log(`In page "${tab.url}": ${results.count} matches.`);
  }
}
// browser.tabs.query({}).then(findInAllTabs);

// background.js

async function redact(matches) {
  // get the active tab ID
  let activeTabArray = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  let tabId = activeTabArray[0].id;

  // execute the content script in the active tab
  await browser.tabs.executeScript(tabId, { file: 'redact.js' });
  // ask the content script to redact matches for us
  await browser.tabs.sendMessage(tabId, { rects: matches.rectData });
}

// browser.browserAction.onClicked.addListener((tab) => {
//   browser.find.find("banana", {includeRectData: true}).then(redact);
// });

async function getContexts(matches) {
  // get the active tab ID
  let activeTabArray = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  let tabId = activeTabArray[0].id;

  // execute the content script in the active tab
  await browser.tabs.executeScript(tabId, { file: 'get-context.js' });
  // ask the content script to get the contexts for us
  let contexts = await browser.tabs.sendMessage(tabId, {
    ranges: matches.rangeData,
  });
  for (let context of contexts) {
    console.log(context);
  }
}

// browser.browserAction.onClicked.addListener((tab) => {
//   browser.find.find("example", {includeRangeData: true}).then(getContexts);
// });
