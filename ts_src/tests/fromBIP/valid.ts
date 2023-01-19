import * as tape from 'tape';
import { Psbt } from '../../lib/psbt';
import { fixtures } from '../fixtures/valid';
import { transactionFromBuffer } from '../utils/txTools';

interface ContainsBip32Paths {
  bip32Derivation?: Array<{ path: string }>;
  tapBip32Derivation?: Array<{ path: string }>;
}

function getPaths(m: ContainsBip32Paths[]): string[] {
  return m
    .map(ele =>
      [...(ele.bip32Derivation || []), ...(ele.tapBip32Derivation || [])].map(
        ({ path }) => path,
      ),
    )
    .reduce((a, b) => [...a, ...b], []);
}

[true, false].forEach(bip32PathsAbsolute => {
  for (const f of fixtures) {
    tape(
      `Test: Should not throw (bip32PathsAbsolute:${bip32PathsAbsolute})`,
      t => {
        let psbt: Psbt;
        t.doesNotThrow(() => {
          psbt = Psbt.fromBase64(f, transactionFromBuffer, {
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
