import * as windows from './windows.js';

export const queries = (arg) => {
  return {
    //
    prefix: windows.getWindowByPrefix,
  }[arg];
};

export const getQueriedTag = (params) => {
  return Promise.resolve(params)
    .then((_params) => _params[0])
    .then(queries)
    .catch(print.failure_get_queried_tag);
};
