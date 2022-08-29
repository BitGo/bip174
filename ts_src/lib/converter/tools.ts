import { KeyValue } from '../interfaces';
import * as varuint from './varint';

export const range = (n: number): number[] => [...Array(n).keys()];

export function reverseBuffer(buffer: Buffer): Buffer {
  if (buffer.length < 1) return buffer;
  let j = buffer.length - 1;
  let tmp = 0;
  for (let i = 0; i < buffer.length / 2; i++) {
    tmp = buffer[i];
    buffer[i] = buffer[j];
    buffer[j] = tmp;
    j--;
  }
  return buffer;
}

export function keyValsToBuffer(keyVals: KeyValue[]): Buffer {
  const buffers = keyVals.map(keyValToBuffer);
  buffers.push(Buffer.from([0]));
  return Buffer.concat(buffers);
}

export function keyValToBuffer(keyVal: KeyValue): Buffer {
  const keyLen = keyVal.key.length;
  const valLen = keyVal.value.length;
  const keyVarIntLen = varuint.encodingLength(keyLen);
  const valVarIntLen = varuint.encodingLength(valLen);

  const buffer = Buffer.allocUnsafe(
    keyVarIntLen + keyLen + valVarIntLen + valLen,
  );

  varuint.encode(keyLen, buffer, 0);
  keyVal.key.copy(buffer, keyVarIntLen);
  varuint.encode(valLen, buffer, keyVarIntLen + keyLen);
  keyVal.value.copy(buffer, keyVarIntLen + keyLen + valVarIntLen);

  return buffer;
}

function verifuint64(value: bigint): void {
  if (typeof value !== 'bigint')
    throw new Error('cannot write a non-bigint as a number');
  if (value < 0)
    throw new Error('specified a negative value for writing an unsigned value');
  if (value > 0xffffffffffffffff)
    throw new Error('RangeError: value out of range');
}

export function readUInt64LE(buffer: Buffer, offset: number): bigint {
  const a = BigInt(buffer.readUInt32LE(offset));
  let b = BigInt(buffer.readUInt32LE(offset + 4));
  b *= BigInt(0x100000000);

  verifuint64(b + a);
  return b + a;
}

export function writeUInt64LE(
  buffer: Buffer,
  value: bigint,
  offset: number,
): number {
  verifuint64(value);

  buffer.writeUInt32LE(Number(value & BigInt(0xffffffff)), offset);
  buffer.writeUInt32LE(Number(value / BigInt(0x100000000)), offset + 4);
  return offset + 8;
}
