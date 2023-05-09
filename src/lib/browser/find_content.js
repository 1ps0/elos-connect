/**
 * Get all the text nodes into a single array
 */
function getNodes() {
  let walker = document.createTreeWalker(
    document,
    window.NodeFilter.SHOW_TEXT,
    null,
    false
  );
  let nodes = [];
  while ((node = walker.nextNode())) {
    nodes.push(node);
  }

  return nodes;
}

/**
 * Gets all text nodes in the document, then for each match, return the
 * complete text content of nodes that contained the match.
 * If a match spanned more than one node, concatenate the textContent
 * of each node.
 */
function getContexts(ranges) {
  let contexts = [];
  let nodes = getNodes();

  for (let range of ranges) {
    let context = nodes[range.startTextNodePos].textContent;
    let pos = range.startTextNodePos;
    while (pos < range.endTextNodePos) {
      pos++;
      context += nodes[pos].textContent;
    }
    contexts.push(context);
  }
  return contexts;
}

// browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   sendResponse(getContexts(message.ranges));
// });

// redact.js

/**
 * Add a black DIV where the rect is.
 */
function redactRect(rect) {
  var redaction = document.createElement("div");
  redaction.style.backgroundColor = "black";
  redaction.style.position = "absolute";
  redaction.style.top = `${rect.top}px`;
  redaction.style.left = `${rect.left}px`;
  redaction.style.width = `${rect.right - rect.left}px`;
  redaction.style.height = `${rect.bottom - rect.top}px`;
  document.body.appendChild(redaction);
}

/**
 * Go through every rect, redacting them.
 */
function redactAll(rectData) {
  for (match of rectData) {
    for (rect of match.rectsAndTexts.rectList) {
      redactRect(rect);
    }
  }
}

// browser.runtime.onMessage.addListener((message) => {
//   redactAll(message.rects);
// });
