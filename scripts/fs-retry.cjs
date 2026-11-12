"use strict";

const fs = require("fs");
const fsp = require("fs/promises");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isUnknown(error) {
  return error && (error.code === "UNKNOWN" || error.errno === -4094);
}

function wrap(fn, label) {
  return async function patched(path, ...args) {
    let lastError;
    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        return await fn.call(this, path, ...args);
      } catch (error) {
        lastError = error;
        if (!isUnknown(error)) throw error;
        if (String(path).includes("manifest") || String(path).includes(".next")) {
          console.warn(
            `[fs-retry] ${label} UNKNOWN on ${path} (attempt ${attempt + 1})`
          );
        }
        await sleep(50 * (attempt + 1));
      }
    }
    throw lastError;
  };
}

fsp.writeFile = wrap(fsp.writeFile, "writeFile");
fsp.open = wrap(fsp.open, "open");
fs.promises.writeFile = fsp.writeFile;
fs.promises.open = fsp.open;
