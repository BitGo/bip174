'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tape = require('tape');
const convert = require('../lib/converter');
const proprietaryKeyVal_1 = require('../lib/proprietaryKeyVal');
const typeFields_1 = require('../lib/typeFields');
// Nested decoders that read their own varint lengths must reject
// non-minimal encodings (CSHLD-2225).
const NON_CANONICAL = new RegExp(
  '^RangeError: Format Error: non-canonical varint encoding$',
);
tape('witnessUtxo decode rejects non-canonical script length', t => {
  // 8-byte amount, script length 1 encoded as fd 01 00, then 1 script byte
  const value = Buffer.from('0100000000000000' + 'fd0100' + '51', 'hex');
  t.throws(() => {
    convert.inputs.witnessUtxo.decode({
      key: Buffer.from([typeFields_1.InputTypes.WITNESS_UTXO]),
      value,
    });
  }, NON_CANONICAL);
  t.end();
});
tape('tapTree decode rejects non-canonical leaf script length', t => {
  // depth 0, leaf version c0, script length 1 encoded as fd 01 00, script 51
  const value = Buffer.from('00c0' + 'fd0100' + '51', 'hex');
  t.throws(() => {
    convert.outputs.tapTree.decode({
      key: Buffer.from([typeFields_1.OutputTypes.TAP_TREE]),
      value,
    });
  }, NON_CANONICAL);
  t.end();
});
tape('tapBip32Derivation decode rejects non-canonical leaf hash count', t => {
  // leaf hash count 0 encoded as fd 00 00, then fingerprint (no path)
  const key = Buffer.concat([
    Buffer.from([typeFields_1.InputTypes.TAP_BIP32_DERIVATION]),
    Buffer.alloc(32, 1),
  ]);
  const value = Buffer.from('fd0000' + '00000000', 'hex');
  t.throws(() => {
    convert.inputs.tapBip32Derivation.decode({ key, value }, true);
  }, NON_CANONICAL);
  t.end();
});
tape('decodeProprietaryKey rejects non-canonical identifier length', t => {
  // fc, identifier length 3 encoded as fd 03 00, "abc", subtype 0
  const key = Buffer.from('fc' + 'fd0300' + '616263' + '00', 'hex');
  t.throws(() => {
    proprietaryKeyVal_1.decodeProprietaryKey(key);
  }, NON_CANONICAL);
  t.end();
});
tape('decodeProprietaryKey rejects non-canonical subtype', t => {
  // fc, identifier length 3, "abc", subtype 0 encoded as fd 00 00
  const key = Buffer.from('fc' + '03' + '616263' + 'fd0000', 'hex');
  t.throws(() => {
    proprietaryKeyVal_1.decodeProprietaryKey(key);
  }, NON_CANONICAL);
  t.end();
});
