import { print, notify, register } from "./proxy.js";

// -- util

export const deduplicate = (_tabs) => {
  const seenUrls = new Set();
  return _tabs.filter(tab => {
    if (seenUrls.has(tab.url)) {
      return false;
    }
    seenUrls.add(tab.url);
    return true;
  });
}

export const duplicates = (_tabs) => {
  const urlCounts = new Map();
  _tabs.forEach(tab => {
    urlCounts.set(tab.url, (urlCounts.get(tab.url) || 0) + 1);
  });

  const duplicateUrls = new Set();
  urlCounts.forEach((count, url) => {
    if (count > 1) {
      duplicateUrls.add(url);
    }
  });

  return _tabs.filter(tab => duplicateUrls.has(tab.url));
}


export const zip = (keys, vals) => {
  return keys.reduce((m, key, index) => {
    m[key] = vals[index];
    return m;
  }, {});
}

export const resolvePath = (path, obj, separator = ".") => {
  var properties = Array.isArray(path) ? path : path.split(separator);
  return properties.reduce((prev, curr) => prev && prev[curr], obj);
};

export const intersection = (sA, sB) => {
  return Promise.resolve(sA)
    .then((_sA) => new Set([_sA].flat(1)))
    .then(print.status_intersection_sA)
    .then((_sA) => {
      const result = new Set();
      for (let elem of sB) {
        if (_sA.has(elem)) {
          console.log("[INTERSECTION]", elem);
          result.add(elem);
        }
      }
      console.log("[DONE]", result);
      return [...result];
    })
    .catch(print.failure_intersection);
};

export const union = (sA, sB) => {
  const _keys = new Set(sA);
  for (let elem of sB) {
    _keys.add(elem);
  }
  return [..._keys];
};
