(function () {
    'use strict';

    function noop() { }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    Promise.resolve();

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const print = new Proxy(() => {}, {
      get(target, name) {
        return (args) => {
          let _name = name.toUpperCase().split('_');
          console.log(`[${_name[0]}][${_name.slice(1).join('_')}]`, args);
          return args;
        }
      }
    });

    const notify = new Proxy(() => {}, {
      // TODO set alert level filtering based on _name[0]
      get(target, name) {
        let _name = name.toUpperCase().split('_');
        console.log("NOTIFYING", name, target);
        return (args) => {
          _name[0];
          return browser.notifications.create({
            type: "basic",
            title: _name[0],
            message: _name.slice(1).join('_'),
            // buttons: params.buttons || []
          })
          .catch(print.failure_notify)
          .finally(() => args);
        }
      }
    });

    //.then(register.success_last_message)
    new Proxy(() => {}, {
      get(target, name) {
        let _name = name.toUpperCase().split('_');
        return (args) => {
          console.log(`[REGISTER][${_name[0]}][${_name.slice(1).join('_')}]`, args);
          return args;
        }
      }
    });

    // TODO this might be a router for complex data transformers
    // export const include = new Proxy(() => {}, {
    //   get(target, name) {
    //     return (args) => {
    //       console.log(`[INCLUDE][${name}]`, args);
    //       if (name == 'tabs') {

    //       }
    //       return {
    //         ...args,

    //       };
    //     }
    //   }
    // });

    const search = (args) => {};

    (() => {
      if (typeof browser !== "undefined" && browser.bookmarks) {
        return browser.bookmarks;
      } else if (typeof chrome !== "undefined" && chrome.bookmarks) {
        return chrome.bookmarks;
      } else {
        throw new Error("Bookmark API not supported");
      }
    })();

    /*
    3rd order item for managing workspace objects
    */


    // WORKSPACE

    const workspaceConfig = {
      loadedAt: new Date(),
      version: '0.0.12-prealpha',
      logs: {
        level: "debug",
        target: "local",
        quiet: {
          keywords: [''],
          prefix: ['status', 'success'],
          suffix: ['mounted'],
        },
      },
      notify: {
        level: "error",
        target: "remote",
        quiet: {
          keywords: [''],
          prefix: ['status', 'success'],
          suffix: ['mounted'],
        },
      },
      hosts: {
        local: {
          name: "localhost",
          active: true,
          default: true,
          uri: "http://localhost:3000",
          search: "/api/search",
        },
        remote: {
          name: "remote-1",
          active: false,
          default: false,
          uri: "http://192.168.99.156:3000",
          search: "/api/search",
        },
      },
      playlist: {
        mine: {
          notes: {}, // browser.tabs.getHighlighted(tab.id), textfield input (markdown editor)
          items: {},
          tags: [], // all tags found/used,
        },
      },
      options: {
        filterby: {
          default: "this",
          handleFailure: "stop.critical" // stop proxy actions for actions or ongoing panel monitoring. like an interrupt
        },

      },
      playlistHistory: [],
      recentlySaved: [],
      todo: {},
      journal: [],

    };

    // 2nd order, +complexity dependent @../config/parameters

    const bookmarksFor = (name, otherwise={}) => {
      return Promise.resolve(name)
        .then(search)
        .catch(print.failure_bookmarks_for)
    };

    const configWritable = writable(workspaceConfig);
    const layoutItemsWritable = writable(bookmarksFor("layoutItems", { items: [], add: [] }));

    const stores = {
      config: configWritable,
      layoutItems: layoutItemsWritable,
    };


    Object.entries(stores).forEach((entry) => {
      entry[0];
      let store = entry[1];
      store.subscribe((val) => {
        if (val !== undefined && val !== "undefined") {
          return Promise.resolve({ name: val })
            .then(search)
            .then(print.success_storage_bookmarks)
            .catch(print.failure_storage_bookmarks);
        }
      });
    });

    // ------- Send to webpage content_inject.js

    const toContent = (args) => {
      return Promise.resolve(args)
        .then(print.status_send_to_content)
        .then((data) => {
          browser.tabs.sendMessage(data.tabId, data);
          return {
            ...data,
            success: true
          };
        })
        .then(notify.success)
        .catch(print.failure_send_to_content);
    };

    const setDarkMode = (e) => {
      return Promise.resolve(e)
        .then((data) => ({ tabId: data.id, message:'set.darkMode' }))
        .then(toContent)
        .catch(print.failure_send_toggle_loop);
    };

    // --- 

    const applyDarkMode = (e) => {
      return getCurrentActive()
        .then(setDarkMode)
        .then(print.success_apply_dark_mode)
        .catch(print.failure_apply_dark_mode)
    };

    // ------ Content scripts

    const elementHexMap = {
      "body": ["#1a2028", "#242b34"],
      "div": ["#1a2028", "#242b34"],
      "header": ["#61ba86", "#1e2a34"],
      "nav": ["#a2b0c7", "#242b34"],
      "main": ["#1a2028", "#242b34"],
      "section": ["#1a2028", "#242b34"],
      "article": ["#1a2028", "#242b34"],
      "aside": ["#b5c2d9", "#242b34"],
      "footer": ["#4cb2ff", "#1e2a34"],
      "h1": ["#61ba86", "#242b34"],
      "h2": ["#a2b0c7", "#242b34"],
      "h3": ["#b5c2d9", "#242b34"],
      "h4": ["#b4bcde", "#242b34"],
      "h5": ["#4cb2ff", "#242b34"],
      "h6": ["#95b6f5", "#242b34"],
      "p": ["#b5c2d9", "#242b34"],
      "a": ["#4cb2ff", "#242b34"],
      "button": ["#61ba86", "#242b34"],
      "input": ["#293340", "#242b34"],
      "textarea": ["#293340", "#242b34"],
      "select": ["#293340", "#242b34"],
      "table": ["#1a2028", "#242b34"],
      "tr": ["#1a2028", "#242b34"],
      "td": ["#b5c2d9", "#242b34"],
      "th": ["#61ba86", "#242b34"],
      "ul": ["#1a2028", "#242b34"],
      "ol": ["#1a2028", "#242b34"],
      "li": ["#b5c2d9", "#1a2028"],
      "code": ["#b5c2d9", "#1a2028"],
      "pre": ["#363f4e", "#1a2028"],
    };

    const getPlayingInfo = (playing) => {
      return playing.map((obj) => {
        return {
          url: obj.src,
          autoplay: obj.autoplay,
          autopip: obj.autopictureinpicture,
          paused: obj.paused,
          muted: obj.muted,
          loop: obj.loop,
          currentTime: obj.currentTime,
          duration: obj.duration
        }
      });
    };

    const renderPlayingStatus = (playing) => {
      if (playing.length > 0) {
        return {
          playable: playing.map((obj) => {
            return {
              ...obj,
              hasPlayable: true,
              playing: !obj.paused,
              loop: obj.loop,
            }
          }),
          url: window.location.href
        };
      }
    };

    /**
     * Gets all text nodes in the document, then for each match, return the
     * complete text content of nodes that contained the match.
     * If a match spanned more than one node, concatenate the textContent
     * of each node.
     */
    const getTextForRanges = (ranges) => {

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

    // This file is actionsed into and runs this code in the browser tab.
    print.load_elos_connect_content_actions();

    const handleMediaMessage = (obj, sendResponse) => {
      return Promise.resolve(obj)
        .then(obj => ({ 
          ...obj,
          message: obj.request.message, 
          tabId: obj.sender.tab.id, 
          tab: obj.sender.tab 
        }))
        .then(toContent)
        .then(getPlayingInfo)
        .then(renderPlayingStatus)
        .then(sendResponse)
        .catch(print.failure_handle_media_message)  
    };

    const handleMessage = (request, sender, sendResponse) => {
      console.log("[CONTENT] Message from the page script:", request, sender, sendResponse);

      const obj = { request, sender, sendResponse };

      if ('media' in request.message) {
        return handleMediaMessage(obj, sendResponse);

      } else if (request.message === "set.darkMode") {
        return Promise.resolve(elementHexMap) // chesterish
          .then(applyDarkMode)
          .then((response) => ({
            response: response,
            success: true 
          }))
          .then(sendResponse)
          .catch(print.failure_handle_message_set_dark_mode)

      } else if (message.action === "set.readerMode") {
        return Promise.resolve()
          .then(zipImagesAndText)
          .then((zipBuffer) => ({
            data: zipBuffer,
            success: true,
          }))
          .then(sendResponse)
          .catch(print.failure_zip_images_and_text);

      } else if (request.message === 'action.find') {
        return Promise.resolve(request)
          .then(getTextForRanges)
          .then(print.status_find)
          .then((findObj) => {
            return findObj;
          })
          .then(sendResponse)
          .catch(print.failure_handle_message_find);

      } else if (request.message = "action.extractReaderText") {
        return extractReaderText()
          .then(sendResponse)
          .catch(print.failure_handle_message_extract_reader_text);
      }
    };

    try {
      print.success_content_actions_js_mounted();
      browser.runtime.onMessage.addListener(handleMessage);
      console.log("content_actions.js finished mounting");
    } catch (e) {
      console.log("Caught content_actions.js init error", e);
    }

})();
//# sourceMappingURL=content_actions.js.map
