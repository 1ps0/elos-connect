// promise CRUD for alarms webextension api

import * as proxy from "./proxy.js";

const create = (item) => {
  // item == {name, when, interval}
  return Promise.resolve(item)
    .then((alarm) => {
      return browser.alarms.create(alarm.name, {
        when: alarm.when,
        periodInMinutes: alarm.interval,
      });
    })
    .catch(proxy.print.failure_alarms_create);
};

const get = (name) => {
  return Promise.resolve(name)
    .then(browser.alarms.get)
    .catch(proxy.print.failure_alarms_get);
};

const update = (item) => {
  // item == {name, updates}
  return Promise.resolve(item)
    .then(browser.alarms.update)
    .catch(proxy.print.failure_alarms_update);
};

const remove = (name) => {
  return Promise.resolve(name)
    .then(browser.alarms.clear)
    .catch(proxy.print.failure_alarms_remove);
};

const getAll = (args) => {
  return Promise.resolve(args)
    .then(browser.alarms.getAll)
    .catch(proxy.print.failure_alarms_get_all);
};

export { create, read, update, remove, getAll };
