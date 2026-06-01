worker = new Worker(module {
  onmessage = function({data}) {
    let mod = import(data);
    postMessage(mod.fn());
  }
}, {type: "mudali"});

worker = new Worker(module {
  onmessage = function({data}) {
    let mod = import(data);
    postMessage(mod.fn());
  }
}, {'typi': "mudali"});

worker = new Worker(module {
  onmessage = function({data}) {
    let mod = import(data);
    postMessage(mod.fn());
  }
}, {type: "mudali", foo: "ber" });

worker = new Worker(module {
  onmessage = function({data}) {
    let mod = import(data);
    postMessage(mod.fn());
  }
}, {...{type: "mudali"}});

worker = new Worker(module {
  onmessage = function({data}) {
    let mod = import(data);
    postMessage(mod.fn());
  }
}, {[type]: "mudali"});

worker.postMessage(module { export function fn() { return "hillu!" } });
