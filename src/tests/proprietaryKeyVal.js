'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tape = require('tape');
const proprietaryKeyVal_1 = require('../lib/proprietaryKeyVal');
const proprietaryKeyVal_2 = require('./fixtures/proprietaryKeyVal');
for (const f of proprietaryKeyVal_2.fixtures.encode) {
  const { identifier, subtype, identifierEncoding } = f.data;
  const { outputKey, aggregatedKey } = f.data.keydata;
  const keydata = Buffer.allocUnsafe(outputKey.length + aggregatedKey.length);
  [outputKey, aggregatedKey].forEach((pubkey, i) =>
    Buffer.from(pubkey, 'ascii').copy(keydata, i * pubkey.length),
  );
  if (f.expected) {
    tape('Proprietary key encode success:', t => {
      const proprietaryKey = proprietaryKeyVal_1.encodeProprietaryKey({
        identifier,
        identifierEncoding: identifierEncoding,
        subtype,
        keydata,
      });
      t.same(proprietaryKey.toString('hex'), f.expected);
      t.end();
    });
  } else if (f.exception) {
    tape('Proprietary key encode failure:', t => {
      t.throws(() => {
        proprietaryKeyVal_1.encodeProprietaryKey({
          identifier,
          identifierEncoding: identifierEncoding,
          subtype,
          keydata,
        });
      }, new RegExp(f.exception));
      t.end();
    });
  } else {
    throw new Error('Invalid fixture format');
  }
}
for (const f of proprietaryKeyVal_2.fixtures.decode) {
  if (f.expected) {
    tape('Proprietary key decode success:', t => {
      const proprietaryKey = proprietaryKeyVal_1.decodeProprietaryKey(
        Buffer.from(f.data.key, 'hex'),
        f.data.identifierEncoding,
      );
      const { identifier, subtype, keydata, identifierEncoding } = f.expected;
      const { outputKey, aggregatedKey } = keydata;
      const decodedOutputKey = proprietaryKey.keydata.toString(
        'ascii',
        0,
        outputKey.length,
      );
      const decodedAggregatedKey = proprietaryKey.keydata.toString(
        'ascii',
        aggregatedKey.length,
      );
      t.same(proprietaryKey.identifier, identifier);
      t.same(proprietaryKey.identifierEncoding, identifierEncoding);
      t.same(proprietaryKey.subtype, subtype);
      t.same(decodedOutputKey, outputKey);
      t.same(decodedAggregatedKey, aggregatedKey);
      t.end();
    });
  } else if (f.exception) {
    tape('Proprietary key decode failure:', t => {
      t.throws(() => {
        proprietaryKeyVal_1.decodeProprietaryKey(
          Buffer.from(f.data.key, 'hex'),
          f.data.identifierEncoding,
        );
      }, new RegExp(f.exception));
      t.end();
    });
  } else {
    throw new Error('Invalid fixture format');
  }
}
