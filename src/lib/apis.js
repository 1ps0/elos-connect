// 2nd order

import { clockFormatter, dateStringFromDate } from "./clock.js";
import { stores } from "./stores.js";

// -- reactive globals


// -- primitive functions

export const handleResponse = async (response) => {
  if (response.ok) { // if HTTP-status is 200-299
    let data = await response.json();
    return data;
  } else {
    console.log("HTTP-Error: ", response.status);
    return null;
  }
}

export const _fetch = async (url, params={}) => {
  /*
  OPTIONS:
  - replace base url with env var or other
  - add POST option for sending to same domain.
  */
  let baseUrl = "http://localhost:8080";
  let _url = new URL(url, baseUrl);

  for (let arg in params) {
    _url.searchParams.append(arg, params[arg]);
  }

  let response = await fetch(_url);
  return handleResponse(response);
};

export const _send = async (url, params={}) => {
  /*
  OPTIONS:
  - replace base url with env var or other
  - add POST option for sending to same domain.
  */
  let baseUrl = "http://localhost:8080";
  let _url = new URL(url, baseUrl);

  params.method = "POST";

  let response = await fetch(_url, params);
  return handleResponse(response);
}

// -- ensemble / client / api functions

export const fileList = async (params) => {
  let data = await _fetch("/api/file/search", params);
  stores.files.update(n => ({...n, ...data, dirty: false }));

  console.log("updated filelist", data, params);
};

// -- filters

export const findMatches = (options, searchTerm) =>
  options.filter(option => {
    const foundIndex = option.toLowerCase().indexOf(
      searchTerm.toLowerCase()
    )

    return foundIndex > -1
  })

export const spanWrapSearchTerm = (option, foundIndex, searchTermLength) => {
  const searchTerm = option.slice(foundIndex, foundIndex + searchTermLength)

  return `<span>${searchTerm}</span>`
}

export const boldSearchTerm = (option, searchTerm) => {
  const lowercaseOption = option.toLowerCase()
  const lowercaseSearchTerm = searchTerm.toLowerCase()
  let foundIndex = lowercaseOption.indexOf(lowercaseSearchTerm)
  let html = ''

  if (!searchTerm) return option

  while (foundIndex !== -1) {
    const previousIndex = foundIndex
    const searchTermLength = searchTerm.length

    if (!html) {
      html = option.slice(0, foundIndex)
    }

    html += spanWrapSearchTerm(option, foundIndex, searchTermLength)

    // check for another match
    foundIndex = lowercaseOption.indexOf(lowercaseSearchTerm, foundIndex + 1)

    if (foundIndex !== -1) {
      // second match: add raw string before next section of html
      html += option.slice(previousIndex + searchTermLength, foundIndex)
    } else {
      // single match, finish the string
      html += option.slice(previousIndex + searchTermLength)
    }
  }

  return html || option
}

// -- event callbacks

export const selectedFile = (item) => item ? item['locations'][0].split('/Volumes/ARCHIVE/')[1] : "";
export const selectedFilePath = (item) => `/api/load?filepath=${selectedFile(item)}`;

export function openFile(e) {
  console.log('open file', e);
  let data = e.detail;
  return _openFile(data);
};

export function _openFile(data) {
  let target;

  if (["md", "txt", "json"].indexOf(data['file.ext']) != -1) {
    target = "panel-editor";
  }
  else if (data['file.ext'] === "pdf") {
    target = "panel-pdf";
  }
  else if (["jpg", "gif", "png"].indexOf(data['file.ext']) != -1) {
    target = "panel-gallery";
  }

  if (target !== undefined) {
    let options = {
      target_name: target,
      props: {
        data: selectedFilePath(data)
      }
    };
    console.log("data for open file", options);

    // stores.history.update(n => [...(n || []), data]);

    stores.layoutItems.update( n => ({
        ...n,
        add: [...n.add, [target, options]]
      })
    );
  }
}

export function _updateHistory(val) {
  console.log("_UPDATE HISTORY", val);
  const date = dateStringFromDate(new Date());
  const fmtDate = clockFormatter.format(new Date());
  // warning: this could get bloated
  let event = { ...val, at: [date, fmtDate] };
  // console.log("update history with", e.detail, event);
  stores.history.update((n) => [...(n || []), event]);
}
export function updateHistory(e) {
  console.log("UPDATE HISTORY", e);
  let val = e.detail;
  _updateHistory(val);
}


export function updateFiletype(e) {
  let typeName = e.detail.name;
  _updateFiletype(typeName);
};
export function _updateFiletype(typeName) {
  stores.files.update((obj) => {
    obj.filetype = typeName;
    return obj;
  });
};

// -- subscriptions

stores.files.subscribe(val => {
  console.log("[update] stores.files update", val);
  /*
  OPTIONS:
  - cache and load different data for api calls and params

  */
  if (val && val !== "undefined" && val.dirty) {
    // FIXME this could have a race condition buried
    fileList((({ files, dirty, ...rest }) => rest)(val));
    stores.files.update(n => ({...(n || {}), dirty: false}));
  }
});

stores.workspace.subscribe((val) => {
  console.log("[update] stores.workspace update", val);
  //JSON.parse(localStorage.getItem(item));
});


stores.history.subscribe((val) => {
  console.log("[update] stores.history update", val);
  /*
  OPTIONS:
  - store to json
  - apply to event queues
  - use as local updates for registered actions or events
  */
});

stores.profile.subscribe((val) => {
  console.log("[update] stores.profile update", val);
  /*
  OPTIONS:
  - sync with remote.
  - handle login/logout user switching, export, saves, validations, etc.
  */
});

stores.actions.subscribe((val) => {
  console.log("[update] registeredActions update", val);
  /*
  OPTIONS:
  - build lists of subscribers for events/updates
  -
  */
});

