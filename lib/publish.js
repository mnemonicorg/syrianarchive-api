import {db} from 'littlefork-plugin-mongodb';
import fs from 'fs';
import dotenv from 'dotenv';
// import {map, merge, take} from 'lodash/fp';

import Promise from 'bluebird';

Promise.promisifyAll(fs);

dotenv.config();

const m = process.env.LF_MONGO_CONNECTION;

db.initialize(m);

// , { $or: [{ dem: { verified: 'TRUE' } }, { dem: { verified: true} }] }

db.findMany('units', { $or: [{'dem.verfied': 'TRUE' }, {'dem.verified': true}] })
  // .then(us => map(u => merge(u, {dem: {verified: true}}), take(3, us)))
  // .then(us => { console.log(us); return us; })
  // .then(us => db.updateData({data: us}))
  .then(us => fs.writeFileAsync('units.json', JSON.stringify(us), 'utf8'))
  .catch(e => console.log(e));
