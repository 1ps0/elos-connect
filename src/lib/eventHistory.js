
import { localForage } from "localForage";
import { createEventDispatcher } from 'svelte';


export function eventHistory(node, item={}) {

  const dispatch = createEventDispatcher();
  const axios = require('axios');

  const gen_id = () => "_" + Math.random().toString(36).substr(2, 9);
  const randomNumberInRange = (min, max) => Math.random() * (max - min) + min;
  const serializeLayout = (val) => { return JSON.stringify({...val, key: 'layout'}) };

  let data = {};
  let _item = {
    id: gen_id(),
    ...item,
  };

  const getData = (uri, params={}) => {
    axios.get(uri, { params: params } )
      .then((response) => {
        console.log(response);
        data.status = response;
      })
      .catch((error) => {
        console.log("got error on fetch", error);
      });
  }

  const sendData = (uri, data={}) => {
    axios.post(uri, { params: data } )
      .then((response) => {
        console.log(response);
        data.status = response;
      })
      .catch((error) => {
        console.log("got error on fetch", error);
      });
  }

  const fetchFromLocalStorage = (item) => {
    return JSON.parse(localStorage.getItem(item));
  };

  const saveToLocalStorage = (item, value) => {
    localStorage.setItem(item, JSON.stringify(value));
  };

  return {
    update(newValue) {
      console.log("updating eventhistory", _item.id, _item, newValue);
    },
    destroy() {
      console.log("destroying eventhistory", _item.id);
    }
  };
}