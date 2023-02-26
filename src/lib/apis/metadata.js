
import * as proxy from "./apis/proxy.js";

export const getBrowserInfo = async () => {
  return browser.runtime.getBrowserInfo()
  .then((_b) => {
    return {
      name: _b.name,
      version: _b.version
    }
  })
  .catch(proxy.print.failure_get_browser_info);
};
