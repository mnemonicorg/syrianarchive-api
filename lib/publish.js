import {db} from 'littlefork-plugin-mongodb';
import fs from 'fs';
import dotenv from 'dotenv';
import {map, merge} from 'lodash/fp';

import Promise from 'bluebird';

Promise.promisifyAll(fs);

dotenv.config();

const m = process.env.LF_MONGO_CONNECTION;

db.initialize(m);

const s = u => ` ${u.dem.summary_en} ${u.dem.summary_ar} ${u.dem.description} ${u.dem.online_title} ${u.dem.online_title_en} ${u.online_title_ar} ${u.dem.notes} ${u.dem.keywords} ${u.dem.collections} `;

const mapU = u => u.dem;
const convertUs = map(mapU);
// , { $or: [{'dem.verfied': 'TRUE' }, {'dem.verified': true}] }

db.findMany('units', { $or: [{'dem.verfied': 'TRUE' }, {'dem.verified': true}] })
  .then(map(u => merge(u, {dem: {searchable: s(u)}})))
  .then(convertUs)
  .then(us => fs.writeFileAsync('units.json', JSON.stringify(us), 'utf8'))
  .catch(e => console.log(e));
