"use strict";

function isSafeKey(key) {
  if (typeof key !== "string") return false;
  const blocked = ["__proto__", "prototype", "constructor"];
  if (blocked.includes(key)) return false;
  return /^[a-zA-Z0-9_]+$/.test(key);
}
let Module = {};
let initializedJS = false;
function threadPrintErr(...args) {
  const text = args.join(" ");
  console.error(text);
}
function threadAlert(...args) {
  const text = args.join(" ");
  postMessage({
    cmd: "alert",
    text: text,
    threadId: Module["_pthread_self"]()
  });
}
const err = threadPrintErr;
self.alert = threadAlert;
if (isSafeKey("instantiateWasm")) {
  Module["instantiateWasm"] = (info, receiveInstance) => {
    const module = Module["wasmModule"];
    Module["wasmModule"] = null;
    const instance = new WebAssembly.Instance(module, info);
    return receiveInstance(instance);
  };
}
self.onunhandledrejection = e => {
  throw e.reason || e;
};
function handleMessage(e) {
  // Verify message origin when available to avoid processing messages
  // from unexpected sources.
  if (typeof e.origin !== "undefined" && e.origin) {
    // In a worker, self.location.origin represents the expected origin.
    var expectedOrigin = typeof self.location !== "undefined" && self.location && self.location.origin ? self.location.origin : null;
    if (expectedOrigin && e.origin !== expectedOrigin) {
      err && err(`Ignored message from unexpected origin: ${e.origin}`);
      return;
    }
  }
  try {
    if (e.data.cmd === "load") {
      const messageQueue = [];
      self.onmessage = e => messageQueue.push(e);
      self.startWorker = instance => {
        Module = instance;
        postMessage({
          cmd: "loaded"
        });
        for (const msg of messageQueue) {
          handleMessage(msg);
        }
        self.onmessage = handleMessage;
      };
      if (isSafeKey("wasmModule")) {
        Module["wasmModule"] = e.data.wasmModule;
      }
      for (const handler of e.data.handlers) {
        if (isSafeKey(handler)) {
          Module[handler] = (...args) => {
            postMessage({
              cmd: "callHandler",
              handler: handler,
              args: args
            });
          };
        }
      }
      if (isSafeKey("wasmMemory")) {
        Module["wasmMemory"] = e.data.wasmMemory;
      }
      if (isSafeKey("buffer")) {
        Module["buffer"] = Module["wasmMemory"].buffer;
      }
      if (isSafeKey("ENVIRONMENT_IS_PTHREAD")) {
        Module["ENVIRONMENT_IS_PTHREAD"] = true;
      }
      (e.data.urlOrBlob ? import(e.data.urlOrBlob) : import("./zerofishEngine.js")).then(exports => exports.default(Module));
    } else if (e.data.cmd === "run") {
      Module["__emscripten_thread_init"](e.data.pthread_ptr, /*is_main=*/0, /*is_runtime=*/0, /*can_block=*/1);
      Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);
      Module["establishStackSpace"]();
      Module["PThread"].receiveObjectTransfer(e.data);
      Module["PThread"].threadInitTLS();
      if (!initializedJS) {
        initializedJS = true;
      }
      try {
        Module["invokeEntryPoint"](e.data.start_routine, e.data.arg);
      } catch (ex) {
        if (ex !== "unwind") {
          throw ex;
        }
      }
    } else if (e.data.cmd === "cancel") {
      if (Module["_pthread_self"]()) {
        Module["__emscripten_thread_exit"](-1);
      }
    } else if (e.data.target === "setimmediate") {
      // no-op
    } else if (e.data.cmd === "checkMailbox") {
      if (initializedJS) {
        Module["checkMailbox"]();
      }
    } else if (e.data.cmd) {
      err(`worker.js received unknown command ${e.data.cmd}`);
      err(e.data);
    }
  } catch (ex) {
    Module["__emscripten_thread_crashed"]?.();
    throw ex;
  }
}
self.onmessage = handleMessage;