
import * as network from "./network.js";
import * as proxy from "./proxy.js";

export const getAllLocal = (args) => {
  return Promise.resolve(args)
    .then(_args => (_args && _args.length) ? _args : undefined)
    .then(browser.storage.local.get)
    .catch(proxy.print.failure_sync);
}

export const setup = (args) => {
  return browser.storage.local.onChanged.addListener((changes) => {
    Promise.resolve(changes)
      .then(Object.entries)
      .then((entries) => {
        entries.forEach((entry) => {
          let key = entry[0];
          let oldValue = entry[1].oldValue;
          let newValue = entry[1].newValue;
        })
      })
      .catch(proxy.print.failure_setup_storage);
    });
}

export const sync = (args) => {
  // args: storageKey, priority:mine|theirs|merge
  return Promise.resolve(args)
    .then(browser.storage.local.get)
    .then((data) => ({
      uri: `/api/pkg/mine/sync`, // TODO enable custom and automatic package names
      body: data
    }))
    .then(network_send)
    .catch(proxy.print.failure_sync_storage);
}

export const clearKey = (args) => {
  // args: storageKey == saveKey == originKey
  // return Promise.resolve(args)
    // .then(storageKeys => ({
    //   storageKeys[0]:[]
    // }))
    // .then(browser.storage.local.set)
    // .catch(proxy.print.failure_storage_clear)

}