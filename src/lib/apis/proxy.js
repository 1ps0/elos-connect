import { get } from 'svelte/store';

export const print = new Proxy(() => {}, {
  get(target, name) {
    return (args) => {
      let _name = name.toUpperCase().split('_');
      console.log(`[${_name[0]}][${_name.slice(1).join('_')}]`, args);
      return args;
    }
  }
});

export const notify = new Proxy(() => {}, {
  // TODO set alert level filtering based on _name[0]
  get(target, name) {
    let _name = name.toUpperCase().split('_');
    console.log("NOTIFYING", name, target);
    return (args) => {
      const state = _name[0];
      return browser.notifications.create({
        type: "basic",
        title: _name[0],
        message: _name.slice(1).join('_'),
        // buttons: params.buttons || []
      })
      .catch(print.failure_notify)
      .finally(() => args);
    }
  }
});

//.then(register.success_last_message)
export const register = new Proxy(() => {}, {
  get(target, name) {
    let _name = name.toUpperCase().split('_');
    return (args) => {
      console.log(`[REGISTER][${_name[0]}][${_name.slice(1).join('_')}]`, args);
      return args;
    }
  }
});

// TODO this might be a router for complex data transformers
// export const include = new Proxy(() => {}, {
//   get(target, name) {
//     return (args) => {
//       console.log(`[INCLUDE][${name}]`, args);
//       if (name == 'tabs') {

//       }
//       return {
//         ...args,

//       };
//     }
//   }
// });
