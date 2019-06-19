import { KeyValue, RedeemScript } from '../../interfaces';

export function makeConverter(
  TYPE_BYTE: number,
): {
  decode: (keyVal: KeyValue) => RedeemScript;
  encode: (data: RedeemScript) => KeyValue;
} {
  return {
    decode,
    encode,
  };
  function decode(keyVal: KeyValue): RedeemScript {
    if (keyVal.key[0] !== TYPE_BYTE) {
      throw new Error(
        'Decode Error: could not decode redeemScript with key 0x' +
          keyVal.key.toString('hex'),
      );
    }
    return keyVal.value;
  }

  function encode(data: RedeemScript): KeyValue {
    const key = Buffer.from([TYPE_BYTE]);
    return {
      key,
      value: data,
    };
  }
}
