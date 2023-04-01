
import { get } from 'svelte/store';
import * as proxy from './proxy.js';

// -- primitive functions

export const _fetch = (args) => {
  // let baseUrl = "http://localhost:3000";
  // let baseUrl = get(stores.config).hosts.local.uri;
  return Promise.resolve(args)
    .then(proxy.default_value.baseURL)
    .then(proxy.default_value.url)
    .then(_args => {
      const url = _args.url;
      for (let arg in _args.args) {
        url.searchargs.append(arg, args.args[arg]);
      }
      return url;
    })
    .then(fetch)
    .then(response.json)
    .then(register.success_last_message)
    .catch(proxy.print.failure_fetch);
};

export const _send = (args) => {
  // let baseUrl = "http://localhost:3000";
  return Promise.resolve(args)
    .then(proxy.default_value.baseURL)
    .then(proxy.default_value.url)
    .then(proxy.default_value.headers)
    .then(_args => {
      return {
        ...args,
        method: "POST",
        credentials: "omit",
        body: JSON.stringify(args.body)
      }
    })
    .then((args) => fetch(args.url, args))
    .then(response.json)
    .then(register.success_last_message)
    .catch(proxy.print.failure_send);
}
