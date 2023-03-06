
import { get } from 'svelte/store';
import { stores } from "./stores.js";
import * as proxy from "./apis/proxy.js";

// -- primitive functions

export const handleResponse = (response) => {
  if (response.ok) { // if HTTP-status is 200-299
    return response.json();
  } else {
    console.log("HTTP-Error: ", response.status);
    return null;
  }
}

export const _fetch = (args) => {
  if (!args || !args.uri || !args.baseURI) {
    return Promise.reject(args)
  }
  if (!args.baseURI) {
    args.baseURI = "http://localhost:3000";
    // get(stores.config).hosts.local.uri
  }
  return Promise.resolve(new URL(args.uri, baseURI))
    .then((url) => {
      for (let arg in args.args) {
        url.searchargs.append(arg, args.args[arg]);
      }
      return url;
    })
    .then(fetch)
    .then(handleResponse)
    .then(register.success_last_message)
    .catch(proxy.print.failure_fetch);
};

export const _send = (args) => {
  if (!args || !args.uri || !args.baseURI) {
    return Promise.reject(args)
  }
  if (!args.baseURI) {
    args.baseURI = "http://localhost:3000";
    // get(stores.config).hosts.local.uri
  }
  return Promise.resolve(new URL(args.uri, baseURI))
    .then((url) => {
      return {
        url: url,
        method: "POST",
        credentials: "omit",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(args.body)
      }
    })
    .then((args) => fetch(args.url, args))
    .then(handleResponse)
    .then(register.success_last_message)
    .catch(proxy.print.failure_send);
}
