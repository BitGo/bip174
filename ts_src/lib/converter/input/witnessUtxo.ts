import { KeyValue, WitnessUtxo } from '../../interfaces';
import { InputTypes } from '../../typeFields';
import { readUInt64LE, writeUInt64LE } from '../tools';
import * as varuint from '../varint';

export function decode(keyVal: KeyValue): WitnessUtxo {
  if (keyVal.key[0] !== InputTypes.WITNESS_UTXO) {
    throw new Error(
      'Decode Error: could not decode witnessUtxo with key 0x' +
        keyVal.key.toString('hex'),
    );
  }
  const value = readUInt64LE(keyVal.value, 0);
  let _offset = 8;
  const scriptLen = varuint.decode(keyVal.value, _offset);
  _offset += varuint.encodingLength(scriptLen);
  const script = keyVal.value.slice(_offset);
  if (script.length !== scriptLen) {
    throw new Error('Decode Error: WITNESS_UTXO script is not proper length');
  }
  return {
    script,
    value,
  };
}

export function encode(data: WitnessUtxo): KeyValue {
  const { script, value } = data;
  const varintLen = varuint.encodingLength(script.length);

  const result = Buffer.allocUnsafe(8 + varintLen + script.length);

  writeUInt64LE(result, value, 0);
  varuint.encode(script.length, result, 8);
  script.copy(result, 8 + varintLen);

  return {
    key: Buffer.from([InputTypes.WITNESS_UTXO]),
    value: result,
  };
}