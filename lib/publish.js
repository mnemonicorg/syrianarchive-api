import fs from 'fs';
import dotenv from 'dotenv';
import {map, merge, uniq, get, flatMap, compact, flow, orderBy} from 'lodash/fp';
import mongodb from 'mongodb';

import Promise from 'bluebird';

Promise.promisifyAll(fs);

dotenv.config();

const m = process.env.LF_MONGO_CONNECTION;


Promise.promisifyAll(mongodb);

const connectionUri = m;

const connection = () =>
  mongodb.MongoClient.connectAsync(connectionUri).disposer(db => db.close());

const findMany = (coll, query = {}, projection = {}) =>
  Promise.using(connection(), db =>
    db
      .collection(coll)
      .find(query, projection)
      .toArray()
  );

const stats = () =>
  Promise.using(connection(), db =>
    db
      .collection('units')
      .stats()
  );


const s = u => `${u.dem.reference_code} ${u.dem.summary_en} ${u.dem.summary_ar} ${u.dem.description} ${u.dem.online_title} ${u.dem.online_title_en} ${u.online_title_ar} ${u.dem.notes} ${u.dem.keywords} ${u.dem.collections} `;

const mapU = u => u.dem;
const convertUs = map(mapU);
// , { $or: [{'dem.verfied': 'TRUE' }, {'dem.verified': true}] }

const variances = (field) => flow([
  flatMap(get(field)),
  compact,
  uniq
]);

let meta = {}; //eslint-disable-line

findMany('units', { $or: [{'dem.verified': 'TRUE' }, {'dem.verified': true}] })
  .then(us => {
    meta = {
      total: us.length,
      verified: us.length,
      weapons: variances('dem.weapons_used')(us),
      collections: variances('dem.collections')(us),
      locations: variances('dem.location')(us),
      // types: variances('dem.type_of_violation')(us),
    };
    return us;
  })
  .then(map(u => merge(u, {dem: {searchable: s(u)}})))
  .then(convertUs)
  .then(orderBy(['incident_date'], ['desc']))
  .then(us => fs.writeFileAsync('units.json', JSON.stringify(us), 'utf8'))

  .then(() => stats())
  .then((st) => {
    meta.total = st.count;
    return '';
  })
  .then(() => fs.writeFileAsync('meta.json', JSON.stringify(meta, null, 2), 'utf8'))
  .then(console.log)
  .catch(e => console.log(e));
