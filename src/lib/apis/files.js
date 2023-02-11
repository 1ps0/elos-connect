
// import { stores } from "./stores.js";

export const selectedFile = (item) => item ? item['locations'][0].split('/Volumes/ARCHIVE/')[1] : "";
export const selectedFilePath = (item) => `/api/load?filepath=${selectedFile(item)}`;

export const fileList = async (params) => {
  // _fetch("/api/file/search", params).then( (data) => {
  //   stores.files.update(n => ({...n, ...data, dirty: false }));
  //   console.log("updated filelist", data, params);
  // }).catch ((err) => {
  //   console.log("failed to update filelist", err, params);
  // })
};

export const openFile = (e) => {
  console.log('open file', e);
  let data = e.detail;
  return _openFile(data);
};


export const _openFile = (data) => {
  let target;

  if (["md", "txt", "json", "py", "js"].indexOf(data['file.ext']) != -1) {
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
        data: selectedFilePath(data),
        language: data['file.ext'] || 'markdown',
        theme: 'vs-light',
        features: ['wordWrap',]
      }
    };
    console.log("data for open file", options);

    // stores.actionHistory.update(n => [...(n || []), data]);

    // TODO take a step back here. this is potentially circular with add() and
    // should be rolled into its own find/add/remove/toggle system for specific
    // content types. so we dont double open a window, but also CAN open two windows
    // of the same kind.
    // stores.layoutItems.update( n => {
    //   n.add.push([target, options]);
    //   n.dirty = true;
    //   return n;
    // });
  }
}
