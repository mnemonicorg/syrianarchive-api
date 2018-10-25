import Promise from 'bluebird';
import {isEmpty, getOr, get, map, identity, pickBy, size, merge, find} from 'lodash/fp';

import {filter} from './filters';


import is from '../data/incidents.json';
import locations from '../data/locations.json';
// import rels from '../data/incidentrelations.json';

console.time('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
const units = map(i => merge(i, {
  searchable: `${i.annotations.title_en}
  ${i.annotations.title_ar}
  ${i.annotations.summary_en}
  ${i.annotations.summary_ar}
  ${i.annotations.incident_code}
  ${i.annotations.incident_date}`,
  units: i.cluster,
  lat: isEmpty(i.annotations.latitude)
    ? getOr(undefined, 'lat', find(z => z.search_name_ar === get('clusters.locations.0', i), locations))
    : i.annotations.latitude,
  lon: isEmpty(i.annotations.longitude)
    ? getOr(undefined, 'lon', find(z => z.search_name_ar === get('clusters.locations.0', i), locations))
    : i.annotations.longitude,
  incident_code: i.id
}))(is);
console.timeEnd('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
// const units = map(i =>
//                set('collections',
//                    (uniq(compact(
//                    ))),
//                    i)
//                , unitsA);

export const list = (b) => {
  console.log('woohooo');
  console.log(b);
  console.time('list');
  const fs = pickBy(identity, b);
  console.log('filts');
  // console.log(fs);
  const page = fs.page - 1 || 0;

  const us = units;

  return filter(fs, us)  // eslint-disable-line
    .then(d => {
      console.log('ppppp');
      console.log(size(units));
      console.log(size(d));
      console.timeEnd('list');
      return {
        stats: {
          total: size(units),
          current: size(d),
          page: page + 1,
        },
        units: d,
      };
    });
};

export const findunit = b => {
  console.log('finding incident ', b);
  const i = find(u => u.aid === b)(units);
  return Promise.resolve(i);
};

export default {
  list,
  findunit
};
