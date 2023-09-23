import { createEventDispatcher } from "svelte";

const logKeywords = {
  success: (_args) => {
    _args;
  },
  failure: (_args) => {
    _args;
  },
  status: (_args) => {
    _args;
  },
  debug: (_args) => {
    _args;
  },
  verbose: (_args) => {
    _args;
  },
};

// export const print = new Proxy(() => {}, {
//   get(target, name) {
//     return (_args) => {
//       try {
//         const parts = name.toUpperCase().split('_');
//         console.log(`[${parts[0]}][${parts.slice(1).join('_')}]`, _args);
//         if (parts[0] == "debug") {
//           console.trace();
//         }
//       }
//       catch(_err) {
//         console.error(name, _err);
//       }
//       return _args;
//     }
//   }
// });

export const print = new Proxy(() => {}, {
  get(target, name) {
    return (_args) => {
      return splitAndUpperCaseString(name)
        .then(
          new Promise(
            (run, skip) => (_name) =>
              _name[0] === "status" ? skip(_name) : run(_name)
          )
        )
        .then((_name) => `[${_name[0]}][${_name.slice(1).join("_")}]`)
        .then((_name) => console.log(_name, _args))
        .catch(console.assert)
        .then((_) => _args);
    };
  },
});

const splitAndUpperCaseString = (_name) => {
  return Promise.resolve(_name)
    .then((name) => name.toUpperCase())
    .then((_n) => _n.split("_"))
    .catch(console.error); // possible cyclical error if we use print
};

export const notify = new Proxy(() => {}, {
  // TODO set alert level filtering based on _name[0]
  get(target, name) {
    return (_args) => {
      return splitAndUpperCaseString(name)
        .then((_name) => ({
          ..._args,
          state: _name[0],
          type: "basic",
          title: _name[0],
          message: _name.slice(1).join("_"),
          // buttons: params.buttons || []
        }))
        .then(browser.notifications.create)
        .catch(print.failure_notify)
        .then((_) => _args);
    };
  },
});

export const ground = new Proxy(() => {}, {
  // acts as a grounding point for any failing cases
  // ends the chain, while also printing the error or fail state
  get(target, name) {
    return (_args) => {
      return (
        splitAndUpperCaseString(name)
          .catch(print.failure_expect)
          // maybe not just print, but also report failure shape and have fallback options
          // forking river not a stopping dam
          .then((_) => _args)
      );
    };
  },
});

export const expect = new Proxy(() => {}, {
  // expect the data to have a certain shape and return true
  // passthrough layer
  get(target, name) {
    return (_args) => {
      return (
        splitAndUpperCaseString(name)
          .catch(print.failure_expect)
          .then((err) => ("abort" in err ? ground : notify))
          // maybe not just print, but also report failure shape and have fallback options
          // forking river not a stopping dam
          .then((_) => _args)
      );
    };
  },
});

const _default_env = {
  baseURL: (args) => `http://localhost:${args.port || 3000}`,
  url: (args) => new URL(args.uri, args.baseUrl),
  headers: (args) => ({
    Accept: "application/json",
    "Content-Type": "application/json",
  }),
};

export const default_value = new Proxy(() => {}, {
  // an atomic action within the chains, smaller chains are atomic and leaf only.
  // monad?
  get(target, name) {
    return (_args) => {
      return splitAndUpperCaseString(name)
        .then((_name) => ({
          ..._args,
          [_name[0]]: _default_env[_name.slice(1)](_args),
        }))
        .catch(print.failure_default_value);
      // .finally(() => _args);
    };
  },
});

//.then(register.success_last_message)
export const register = new Proxy(() => {}, {
  get(target, name) {
    let _name = name.toUpperCase().split("_");
    return (args) => {
      console.log(`[REGISTER][${_name[0]}][${_name.slice(1).join("_")}]`, args);
      return args;
    };
  },
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

// dispatch
export const dispatch = new Proxy(() => {}, {
  get(target, name) {
    const _dispatch = createEventDispatcher();
    return (args) => {
      _dispatch(`${target}:${name}:${args}`, {
        target,
        name,
        args,
      });
      if (name == "tabs") {
      }
      return {
        ...args,
      };
    };
  },
});
