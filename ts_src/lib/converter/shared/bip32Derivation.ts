import { Bip32Derivation, KeyValue } from '../../interfaces';
const range = (n: number): number[] => [...Array(n).keys()];

const isValidDERKey = (pubkey: Buffer): boolean =>
  (pubkey.length === 33 && [2, 3].includes(pubkey[0])) ||
  (pubkey.length === 65 && 4 === pubkey[0]);

export function makeConverter(
  TYPE_BYTE: number,
  isValidPubkey = isValidDERKey,
): {
  decode: (keyVal: KeyValue, bip32PathsAbsolute?: boolean) => Bip32Derivation;
  encode: (data: Bip32Derivation) => KeyValue;
  check: (data: any) => data is Bip32Derivation;
  expected: string;
  canAddToArray: (
    array: Bip32Derivation[],
    item: Bip32Derivation,
    dupeSet: Set<string>,
  ) => boolean;
} {
  function decode(
    keyVal: KeyValue,
    bip32PathsAbsolute = true,
  ): Bip32Derivation {
    if (keyVal.key[0] !== TYPE_BYTE) {
      throw new Error(
        'Decode Error: could not decode bip32Derivation with key 0x' +
          keyVal.key.toString('hex'),
      );
    }
    const pubkey = keyVal.key.slice(1);
    if (!isValidPubkey(pubkey)) {
      throw new Error(
        'Decode Error: bip32Derivation has invalid pubkey in key 0x' +
          keyVal.key.toString('hex'),
      );
    }
    if ((keyVal.value.length / 4) % 1 !== 0) {
      throw new Error(
        'Decode Error: Input BIP32_DERIVATION value length should be multiple of 4',
      );
    }
    const data = {
      masterFingerprint: keyVal.value.slice(0, 4),
      pubkey,
      path: '',
    };
    const path = [];
    if (bip32PathsAbsolute) {
      path.push('m');
    }
    for (const i of range(keyVal.value.length / 4 - 1)) {
      const val = keyVal.value.readUInt32LE(i * 4 + 4);
      const isHard = !!(val & 0x80000000);
      const idx = val & 0x7fffffff;
      path.push(idx.toString(10) + (isHard ? "'" : ''));
    }
    data.path = path.join('/');
    return data;
  }

  function encode(data: Bip32Derivation): KeyValue {
    const head = Buffer.from([TYPE_BYTE]);
    const key = Buffer.concat([head, data.pubkey]);

    const splitPath = data.path ? data.path.split('/') : [];
    const isAbsolutePath = splitPath[0] === 'm';
    const bufferSize = isAbsolutePath
      ? splitPath.length * 4
      : (splitPath.length + 1) * 4;
    const value = Buffer.allocUnsafe(bufferSize);

    data.masterFingerprint.copy(value, 0);
    let offset = 4;
    const writingPath = isAbsolutePath ? splitPath.slice(1) : splitPath;
    writingPath.forEach(level => {
      const isHard = level.slice(-1) === "'";
      let num = 0x7fffffff & parseInt(isHard ? level.slice(0, -1) : level, 10);
      if (isHard) num += 0x80000000;

      value.writeUInt32LE(num, offset);
      offset += 4;
    });

    return {
      key,
      value,
    };
  }

  const expected =
    '{ masterFingerprint: Buffer; pubkey: Buffer; path: string; }';
  function check(data: any): data is Bip32Derivation {
    return (
      Buffer.isBuffer(data.pubkey) &&
      Buffer.isBuffer(data.masterFingerprint) &&
      typeof data.path === 'string' &&
      isValidPubkey(data.pubkey) &&
      data.masterFingerprint.length === 4
    );
  }

  function canAddToArray(
    array: Bip32Derivation[],
    item: Bip32Derivation,
    dupeSet: Set<string>,
  ): boolean {
    const dupeString = item.pubkey.toString('hex');
    if (dupeSet.has(dupeString)) return false;
    dupeSet.add(dupeString);
    return array.filter(v => v.pubkey.equals(item.pubkey)).length === 0;
  }

  return {
    decode,
    encode,
    check,
    expected,
    canAddToArray,
  };
}
