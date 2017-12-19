import fs from 'fs';
import dotenv from 'dotenv';
import {map, merge, uniq, get, flatMap, compact, flow, orderBy, filter} from 'lodash/fp';
import mongodb from 'mongodb';
import moment from 'moment';

import Promise from 'bluebird';

Promise.promisifyAll(fs);

dotenv.config();

const mapW = map.convert({cap: false});

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

const geo = (u, i) => {
  console.log(`${u.incident_date} ${u.incident_time}`);
  console.log('aaaaa');
  return {
    type: 'Feature',
    id: i,
    properties: {
      pattrn_date_time:
        moment(`${u.incident_date} ${u.incident_time}`).format('YYYY-MM-DDTHH:MM:SS'),
      date_time:
        moment(`${u.incident_date} ${u.incident_time}`).format('YYYY-MM-DDTHH:MM:SS'),
      pattrn_location_name: u.location,
      location_name: u.location,
      event_summary: `${u.summary || u.description || u.online_title} <a href='/en/database?unit=${u.reference_code}' target='_blank'>> <b>view video</b></a>`,
      eventcount: 1,
      pattrn_event_summary: `${u.summary || u.description || u.online_title} <a href='/en/database?unit=${u.reference_code}' target='_blank'>> <b>view video</b></a>`,
      collections: u.collections.join(', '),
      violationtype: compact(mapW((v, k) => (v ? k : ''), u.type_of_violation)).join(', '),
      content_type: u.content_type,
      weapons_used: u.weapons_used.join(', '),
      search: u.searchable,
      video: 'http://media.newsy.org/littlefork/youtube_video/41c5c7f988d3502710d4146954b9ed0d2dcd5dc7701b26b4fe28261308f12375/61HnswYygLo.mp4',
    },
    geometry: { type: 'Point',
      coordinates: [
        parseFloat(u.longitude),
        parseFloat(u.latitude)
      ] }
  };
};

const variances = (field) => flow([
  flatMap(get(field)),
  compact,
  uniq
]);

const variancesV = (field) => flow([
  flatMap(u =>
    mapW((v, k) => (v ? k : ''))(get(field, u))
  ),
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
      violationtypes: variancesV('dem.type_of_violation')(us),
      // types: variances('dem.type_of_violation')(us),
    };
    return us;
  })
  .then(map(u => merge(u, {dem: {searchable: s(u)}})))
  .then(convertUs)
  .then(orderBy(['incident_date'], ['desc']))
  .then(us => fs.writeFileAsync('units.json', JSON.stringify(us), 'utf8')
    .then(() => us)
  )
  .then(us => {
    const filtered = filter(u => u.latitude && u.longitude)(us);
    const geos = mapW((k, v) => geo(k, v))(filtered);
    const pattrn = {
      type: 'FeatureCollection',
      features: geos
    };
    return fs.writeFileAsync('geounits.json', JSON.stringify(pattrn, null, 2), 'utf8');
  })

  .then(() => stats())
  .then((st) => {
    meta.total = st.count;
    return '';
  })
  .then(() => fs.writeFileAsync('meta.json', JSON.stringify(meta, null, 2), 'utf8'))
  .then(console.log)
  .catch(e => console.log(e));
