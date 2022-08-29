'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
function fromJson(json) {
  return JSON.parse(json, (_, value) => {
    if (typeof value === 'string') {
      if (/^\d+n$/.test(value)) {
        return BigInt(value.substr(0, value.length - 1));
      }
      if (/^0x[a-f\d]+$/.test(value)) {
        return Buffer.from(value.substr(2), 'hex');
      }
    }
    return value;
  });
}
exports.fromJson = fromJson;
