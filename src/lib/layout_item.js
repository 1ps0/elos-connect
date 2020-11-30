
import layoutGridHelp from "./layout_grid/helper.js";
const axios = require('axios');

export function layoutItem(node, item) {

  const gen_id = () => "_" + Math.random().toString(36).substr(2, 9);
  const randomNumberInRange = (min, max) => Math.random() * (max - min) + min;
  const serializeLayout = (val) => { return JSON.stringify({...val, key: 'layout'}) };

  let _item = layoutGridHelp.item({
    id: gen_id(),
    ...item,
  });

  const getData = (uri) => {
    axios.get("/api/search/topic/", { params: {} } )
      .then((response) => {
        console.log(response);
        data.status = response;
      })
      .catch((error) => {
        console.log("got error on fetch", error);
      });
  }

  return {
    update(newValue) {
      console.log("updating item", _item.id, _item, newValue);
    },
    destroy() {
      console.log("destroying item", _item.id);
    }
  };
}