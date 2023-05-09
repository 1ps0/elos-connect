import * as proxy from "./apis/proxy.js";
import * as contextMenu from "./apis/context_menu.js";

// ------- Register content script

export const registerScript = (hosts) => {
  return Promise.resolve({
    matches: ["<all_urls>"],
    js: [{ file: "build/content_actions.js" }],
    runAt: "document_idle",
  })
    .then(browser.contentScripts.register)
    .catch(proxy.print.failure_content_scripts_register);
};

export const _unregisterScript = (subPointer) => {
  return subPointer.unregister();
};

export const _registerScript = (message) => {
  let hosts = message.hosts;
  let code = message.code;

  return browser.contentScripts.register({
    matches: hosts,
    js: [{ code }],
    runAt: "document_idle",
  });
};

// ------ Content scripts

export const elementHexMap = {
  body: ["#1a2028", "#242b34"],
  div: ["#1a2028", "#242b34"],
  header: ["#61ba86", "#1e2a34"],
  nav: ["#a2b0c7", "#242b34"],
  main: ["#1a2028", "#242b34"],
  section: ["#1a2028", "#242b34"],
  article: ["#1a2028", "#242b34"],
  aside: ["#b5c2d9", "#242b34"],
  footer: ["#4cb2ff", "#1e2a34"],
  h1: ["#61ba86", "#242b34"],
  h2: ["#a2b0c7", "#242b34"],
  h3: ["#b5c2d9", "#242b34"],
  h4: ["#b4bcde", "#242b34"],
  h5: ["#4cb2ff", "#242b34"],
  h6: ["#95b6f5", "#242b34"],
  p: ["#b5c2d9", "#242b34"],
  a: ["#4cb2ff", "#242b34"],
  button: ["#61ba86", "#242b34"],
  input: ["#293340", "#242b34"],
  textarea: ["#293340", "#242b34"],
  select: ["#293340", "#242b34"],
  table: ["#1a2028", "#242b34"],
  tr: ["#1a2028", "#242b34"],
  td: ["#b5c2d9", "#242b34"],
  th: ["#61ba86", "#242b34"],
  ul: ["#1a2028", "#242b34"],
  ol: ["#1a2028", "#242b34"],
  li: ["#b5c2d9", "#1a2028"],
  code: ["#b5c2d9", "#1a2028"],
  pre: ["#363f4e", "#1a2028"],
};
// export const elementHexMap = {
//   "body": ["#1a2028", "#242b34"],
//   "div": ["#1a2028", "#242b34"],
//   "header": ["#61ba86", "#1a2028"],
//   "nav": ["#a2b0c7", "#1a2028"],
//   "main": ["#1a2028", "#242b34"],
//   "section": ["#1a2028", "#242b34"],
//   "article": ["#1a2028", "#242b34"],
//   "aside": ["#b5c2d9", "#1a2028"],
//   "footer": ["#4cb2ff", "#1a2028"],
//   "h1": ["#61ba86", "#1a2028"],
//   "h2": ["#a2b0c7", "#1a2028"],
//   "h3": ["#b5c2d9", "#1a2028"],
//   "h4": ["#b4bcde", "#1a2028"],
//   "h5": ["#4cb2ff", "#1a2028"],
//   "h6": ["#95b6f5", "#1a2028"],
//   "p": ["#c7d1e0", "#1a2028"],
//   "a": ["#4cb2ff", "#1a2028"],
//   "button": ["#61ba86", "#1a2028"],
//   "input": ["#293340", "#1a2028"],
//   "textarea": ["#293340", "#1a2028"],
//   "select": ["#293340", "#1a2028"],
//   "table": ["#1a2028", "#242b34"],
//   "tr": ["#1a2028", "#242b34"],
//   "td": ["#c7d1e0", "#1a2028"],
//   "th": ["#61ba86", "#1a2028"],
//   "ul": ["#1a2028", "#242b34"],
//   "ol": ["#1a2028", "#242b34"],
//   "li": ["#c7d1e0", "#1a2028"],
//   "code": ["#c7d1e0", "#1a2028"],
//   "pre": ["#363f4e", "#1a2028"],
// };

export const applyDarkMode = (schema) => {
  return Promise.resolve(schema)
    .then((colorSchema) => {
      const elements = document.querySelectorAll("*");

      // Loop through all elements and apply the color specified in elementHexMap
      elements.forEach((element) => {
        const elementName = element.tagName.toLowerCase();
        if (elementHexMap[elementName]) {
          element.style.color = elementHexMap[elementName][0];
          element.style.backgroundColor = elementHexMap[elementName][1];
        }
      });
    })
    .catch(proxy.print.failure_apply_dark_mode);
};

export const extractReaderText = () => {
  return {
    title: document.querySelector(".reader-title h1").value,
    link: document.querySelector(".reader-domain a").href,
    readerTime: document.querySelector(".reader-estimated-time").value,
    contentBody: document.querySelectorAll(".page"),
  };
};

// ----- Element Select

export const startElementTracking = () => {
  // Document.elementFromPoint()
};
export const stopElementTracking = () => {};

// ---- Extractive

export const captureScrollPosition = (options = {}) =>
  Promise.resolve(options)
    .then(() => {
      const { document } = options;
      if (!document) {
        document = window.document;
      }

      const currentScrollPosition =
        document.documentElement.scrollTop || document.body.scrollTop;
      const totalScrollHeight =
        document.documentElement.scrollHeight || document.body.scrollHeight;

      return {
        currentScrollPosition,
        totalScrollHeight,
      };
    })
    .catch((error) => {
      console.error("Error capturing scroll position:", error);
      throw error;
    });

// ----- Media Control

export const getPlayable = () => {
  return Promise.resolve(["video", "audio"])
    .then((types) => {
      return types.reduce((_out, _type) => {
        return [
          ..._out,
          ...Array.from(document.querySelectorAll(_type)).filter((el) =>
            isElementVisible(el)
          ),
        ];
      }, []);
    })
    .catch(print.failure_get_playable);
};

export const toggleLoop = () => {
  return getPlayable()
    .then((playing) => {
      playing.forEach((item) => {
        item.loop = !item.loop;
      });
      return playing;
    })
    .catch(print.failure_toggle_loop);
};

export const playPause = () => {
  return getPlayable()
    .then((playing) => {
      console.log("Playing and Pausing", playing);
      playing.forEach((item) => {
        if (item.paused) {
          item.play();
        } else {
          item.pause();
        }
      });
      return playing;
    })
    .catch(print.failure_play_pause);
};

export const restart = () => {
  return getPlayable()
    .then((playing) => {
      console.log("Restarting", playing);
      playing.forEach((item) => {
        item.currentTime = 0;
      });
      return playing;
    })
    .catch(print.failure_play_pause);
};

export const getPlayingInfo = (playing) => {
  return playing.map((obj) => {
    return {
      url: obj.src,
      autoplay: obj.autoplay,
      autopip: obj.autopictureinpicture,
      paused: obj.paused,
      muted: obj.muted,
      loop: obj.loop,
      currentTime: obj.currentTime,
      duration: obj.duration,
    };
  });
};

export const renderPlayingStatus = (playing) => {
  if (playing.length > 0) {
    return {
      playable: playing.map((obj) => {
        return {
          ...obj,
          hasPlayable: true,
          playing: !obj.paused,
          loop: obj.loop,
        };
      }),
      url: window.location.href,
    };
  }
};

// ------ Text handling / searching

/**
 * Get all the text nodes into a single array
 */
export const getTextNodes = () => {
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
};

/**
 * Gets all text nodes in the document, then for each match, return the
 * complete text content of nodes that contained the match.
 * If a match spanned more than one node, concatenate the textContent
 * of each node.
 */
export const getTextForRanges = (ranges) => {
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
};

// ------- zip page as markdown and images

// First, install the zip-buffer library
// npm install zip-buffer

export const zipImagesAndText = () => {
  const imageElements = document.querySelectorAll("img");
  const imageBuffers = [];

  // Iterate over the image elements
  imageElements.forEach((imageElement) => {
    // Get the src attribute of the image element
    const imageUrl = imageElement.src;

    // Make a request to the image URL
    fetch(imageUrl)
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        imageBuffers.push(Buffer.from(buffer));
      });
  });

  const zip = require("zip-buffer");

  const articleElement = document.querySelector("article");
  const markdown = turndownService.turndown(articleElement);

  // When all of the image data Buffers have been collected, you can create a ZIP file in memory
  return Promise.all(imageBuffers)
    .then(() => {
      // Create a ZIP file in memory using the zip-buffer library
      return zip.create([
        {
          name: "article.md",
          data: markdown,
        },
        ...imageBuffers.map((buffer, index) => ({
          name: `image-${index}.jpg`,
          data: buffer,
        })),
      ]);
    })
    .catch(proxy.print.failure_zip_images_and_text);
};

// ------ Dark Mode attempt 1

// Define a function to detect the primary color CSS selectors in the document
export const detectPrimaryColorSelectors = () => {
  // Initialize an array to store the detected selectors
  const selectors = [];

  // Iterate over all the elements in the document
  for (const element of document.querySelectorAll("*")) {
    // Get the computed style of the element
    const style = getComputedStyle(element);

    // Check if the element has a background-color or color property that is not "transparent" or "inherit"
    if (style.backgroundColor !== "transparent" && style.color !== "inherit") {
      // If so, add the element's tag name and class list to the array of selectors
      selectors.push(
        element.tagName +
          (element.classList.length > 0
            ? "." + [...element.classList].join(".")
            : "")
      );
    }
  }

  // Return the array of detected selectors
  return selectors;
};

// Promise.resolve()
// .then(() => {
//     return window.getSelection().toString();
// })
// .then((selectedText) => {
//     contextMenu.config.forEach(menu => {
//         browser.contextMenus.create(menu);
//     });
// })
// .then(() => {
//     console.log("Context menu items created successfully");
// })
// .catch((error) => {
//     console.error(`Error creating context menu items: ${error}`);
// });
