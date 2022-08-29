import * as tape from 'tape';
import { Psbt } from '../lib/psbt';
import { toJson } from '../lib/utils';
import { fixtures } from './fixtures/combine';
import { fromJson } from './utils/json';
import { transactionFromBuffer } from './utils/txTools';

for (const f of fixtures) {
  tape('Test: ' + f.description, t => {
    const psbts = f.psbts.map(p => Psbt.fromHex(p, transactionFromBuffer));
    const jsonA1 = toJson(psbts[0]);
    const jsonA2 = toJson(psbts[1]);
    psbts[0].combine(psbts[1]);
    const jsonB1 = toJson(psbts[0]);
    const jsonB2 = toJson(psbts[1]);

    // console.log(jsonA1);
    // console.log(jsonA2);
    // console.log(jsonB1);
    // console.log(jsonB2);

    t.notDeepEqual(fromJson(jsonA1), fromJson(jsonB1));
    t.deepEqual(fromJson(jsonA2), fromJson(jsonB2));
    t.equal(psbts[0].toHex(), f.result);
    t.end();
  });
}
