'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tape = require('tape');
const psbt_1 = require('../../lib/psbt');
const valid_1 = require('../fixtures/valid');
const txTools_1 = require('../utils/txTools');
function getPaths(m) {
  return m
    .map(ele =>
      [...(ele.bip32Derivation || []), ...(ele.tapBip32Derivation || [])].map(
        ({ path }) => path,
      ),
    )
    .reduce((a, b) => [...a, ...b], []);
}
[true, false].forEach(bip32PathsAbsolute => {
  for (const f of valid_1.fixtures) {
    tape(
      `Test: Should not throw (bip32PathsAbsolute:${bip32PathsAbsolute})`,
      t => {
        let psbt;
        t.doesNotThrow(() => {
          psbt = psbt_1.Psbt.fromBase64(f, txTools_1.transactionFromBuffer, {
            bip32PathsAbsolute,
          });
          const paths = [...getPaths(psbt.inputs), ...getPaths(psbt.outputs)];
          paths.forEach(path => {
            if (bip32PathsAbsolute) {
              t.equal(path[0], 'm');
            } else if (path.length > 0) {
              t.assert(path[0].match(/\d/));
            }
          });
        }, 'fromBase64');
        t.doesNotThrow(() => {
          const out = psbt.toBase64();
          t.equal(out, f);
        }, 'toBase64');
        t.end();
      },
    );
  }
});
