
import * as proxy from "./proxy.js";

// backbone of messaging system
// NOTE: will be different across contexts (?)
const ports = {};
export const addPort = (p) => {
  console.log("Adding port for tab", p.sender.tab.id, p);
  ports[p.sender.tab.id] = p;
}
export const getPorts = () => {
  return ports;
}
export const removePort = (tabId) => {
  console.log("Deleting port for tab", tabId);
  delete ports[tabId];
};

export const createRuntimeConnection = async (params) => {
  return browser.runtime.connect({
    connectInfo: {
      name: params.name
    }
  });
};

const relayRegistry = {};
export const setupRelay = (params) => {
  // TODO lazy capture incoming ports from external sources:
  // external sources: sidebar, page content.

  // getPorts
  // TODO add 'args' which let you include select keys too
  const ports = () => {
    return Promise.resolve(relayRegistry)
      .then(Object.values)
      .then((values) => values.map((relay) => relay.port))
      .then(Array.from)
      .catch(proxy.print.failure_get_ports)
  }

  const handleMessage = (args) => {
    console.log("[RELAY][MESSAGE][RECEIVE]", args, params.debug ? params : '');
    if (params.handler) {
      params.handler(args);
    }
  }
  const postMessage = (args) => {
    let _postData = relayRegistry[params.name];
    console.log("[RELAY][MESSAGE][SEND]", args, params.debug ? params : '');
    if (args.action === "disconnect") {
      postData.port.disconnect(); // should trigger a callback disconnecting the rest
    }
    return _postData.port.postMessage(args)
  }
  const initRelay = (name) => {
    const port = browser.runtime.connect({ name: name });
    port.onMessage.addListener((args) => {
      return Promise.resolve(args)
        .then(handleMessage)
        .catch(proxy.print.failure_port_message)
    });
    return port;
  };
  // addPort
  browser.runtime.onConnect.addListener((args) => {
    console.log("[RELAY][CONNECT][NEW]", args);
    let _port = initRelay(args);
    args.name = args.name ? args.name : params.name // TODO add random gen etag type
    relayRegistry[args.name] = {
      ...params,
      ...args,
      port: _port
    };
  });
  // removePort
  browser.runtime.onDisconnect.addListener((params) => {
    if (!params.name) {
      console.log("[RELAY][DISCONNECT][FAILURE]", "No field 'name'", params)
    }
    let _connection = relayRegistry[params.name];
    _connection.port.disconnect(); // can be used to validate a mutual disconnection
    relayRegistry[params.name] = null;
  })
  console.log("[RELAY][INIT]", params);
  return postMessage; // everything else is internally handled
}


