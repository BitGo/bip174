'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tape = require('tape');
const psbt_1 = require('../lib/psbt');
const utils_1 = require('../lib/utils');
const first_1 = require('./fixtures/first');
const json_1 = require('./utils/json');
const txTools_1 = require('./utils/txTools');
for (const f of first_1.fixtures) {
  tape('Test: ' + f.description, t => {
    const parsed = psbt_1.Psbt.fromHex(
      f.input,
      txTools_1.transactionFromBuffer,
    );
    const hex = parsed.toHex();
    const parsed2 = psbt_1.Psbt.fromHex(hex, txTools_1.transactionFromBuffer);
    const hex2 = parsed2.toHex();
    const parsed3 = psbt_1.Psbt.fromHex(hex2, txTools_1.transactionFromBuffer);
    t.strictEqual(parsed.toHex(), parsed2.toHex());
    t.strictEqual(parsed.toHex(), parsed3.toHex());
    // @ts-ignore
    parsed3.globalMap.unsignedTx = parsed3.globalMap.unsignedTx.toBuffer();
    t.deepEqual(json_1.fromJson(utils_1.toJson(parsed3)), f.output);
    t.equal(hex, hex2);
    t.end();
  });
}
