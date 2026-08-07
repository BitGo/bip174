import * as tape from 'tape';
import { Psbt } from '../lib/psbt';
import { getDefaultTx, transactionFromBuffer } from './utils/txTools';

const SCRIPT = Buffer.from(
  'a914e18870f2c297fbfca54c5c6f645c7745a5b66eda87',
  'hex',
);

// Proprietary key: 0xfc prefix + identifier + subtype (type byte 0xfc is
// above both InputTypes (16 entries) and OutputTypes (6 entries), so it is
// always an unknown key for either map).
const PROPRIETARY_KEY = Buffer.from('fc0a626974676f2f6d7573696700', 'hex');
const PROPRIETARY_VAL = Buffer.from('deadbeef', 'hex');

tape(
  'Test: addOutput routes unknownKeyVals to output map, not input map',
  t => {
    const psbt = new Psbt(getDefaultTx());
    psbt.addInput({
      hash: '865dce988413971fd812d0e81a3395ed916a87ea533e1a16c0f4e15df96fa7d4',
      index: 0,
    });
    psbt.addOutput({
      script: SCRIPT,
      value: 1000000,
      unknownKeyVals: [{ key: PROPRIETARY_KEY, value: PROPRIETARY_VAL }],
    });

    // Key must be on the output, not the input
    t.deepEqual(
      psbt.outputs[0].unknownKeyVals,
      [{ key: PROPRIETARY_KEY, value: PROPRIETARY_VAL }],
      'output[0].unknownKeyVals contains the proprietary key',
    );
    t.deepEqual(
      psbt.inputs[0].unknownKeyVals,
      [],
      'input[0].unknownKeyVals is empty',
    );

    // Placement must survive a serialize/parse round-trip
    const psbt2 = Psbt.fromHex(psbt.toHex(), transactionFromBuffer);
    t.deepEqual(
      psbt2.outputs[0].unknownKeyVals,
      [{ key: PROPRIETARY_KEY, value: PROPRIETARY_VAL }],
      'output[0].unknownKeyVals survives round-trip',
    );
    // fromBuffer leaves unknownKeyVals undefined when there are none;
    // either undefined or [] is acceptable here.
    t.ok(
      !psbt2.inputs[0].unknownKeyVals ||
        psbt2.inputs[0].unknownKeyVals.length === 0,
      'input[0].unknownKeyVals is empty after round-trip',
    );

    t.end();
  },
);

tape(
  'Test: addOutput with unknownKeyVals does not throw when outputs > inputs',
  t => {
    // Common case: 1 input, 2 outputs — the second addOutput formerly threw
    // "No input #1" because it called addUnknownKeyValToInput(1, ...).
    const psbt = new Psbt(getDefaultTx());
    psbt.addInput({
      hash: '865dce988413971fd812d0e81a3395ed916a87ea533e1a16c0f4e15df96fa7d4',
      index: 0,
    });
    psbt.addOutput({ script: SCRIPT, value: 1000000 });

    t.doesNotThrow(() => {
      psbt.addOutput({
        script: SCRIPT,
        value: 500000,
        unknownKeyVals: [{ key: PROPRIETARY_KEY, value: PROPRIETARY_VAL }],
      });
    }, 'second addOutput with unknownKeyVals must not throw');

    t.deepEqual(
      psbt.outputs[1].unknownKeyVals,
      [{ key: PROPRIETARY_KEY, value: PROPRIETARY_VAL }],
      'output[1] holds the proprietary key',
    );

    t.end();
  },
);

tape('Test: add Input Output', t => {
  const psbt = new Psbt(getDefaultTx());
  psbt.addInput({
    hash: '865dce988413971fd812d0e81a3395ed916a87ea533e1a16c0f4e15df96fa7d4',
    index: 3,
  });
  psbt.addInput({
    hash: 'ff5dce988413971fd812d0e81a3395ed916a87ea533e1a16c0f4e15df96fa7d4',
    index: 1,
  });
  psbt.addOutput({
    script: Buffer.from(
      'a914e18870f2c297fbfca54c5c6f645c7745a5b66eda87',
      'hex',
    ),
    value: 1234567890,
  });
  psbt.addOutput({
    script: Buffer.from(
      'a914e18870f2c297fbfca54c5c6f645c7745a5b66eda87',
      'hex',
    ),
    value: 987654321,
  });
  const hex = psbt.toHex();
  const hex2 = Psbt.fromHex(hex, transactionFromBuffer).toHex();
  t.equal(
    hex,
    '70736274ff01009c0100000002d4a76ff95de1f4c0161a3e53ea876a91ed95331ae8d01' +
      '2d81f97138498ce5d860300000000ffffffffd4a76ff95de1f4c0161a3e53ea876a91' +
      'ed95331ae8d012d81f97138498ce5dff0100000000ffffffff02d2029649000000001' +
      '7a914e18870f2c297fbfca54c5c6f645c7745a5b66eda87b168de3a0000000017a914' +
      'e18870f2c297fbfca54c5c6f645c7745a5b66eda87000000000000000000',
  );
  t.equal(hex, hex2);

  // console.log(jsonA1);
  // console.log(jsonA2);
  // console.log(jsonB1);
  // console.log(jsonB2);

  // t.notDeepEqual(JSON.parse(jsonA1), JSON.parse(jsonB1));
  // t.deepEqual(JSON.parse(jsonA2), JSON.parse(jsonB2));
  t.end();
});
