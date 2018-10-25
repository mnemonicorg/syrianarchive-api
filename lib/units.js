import Promise from 'bluebird';
import {map, identity, pickBy, size, find, set, get, replace, trimEnd} from 'lodash/fp';

import {filter} from './filters';

import units from '../data/units.json';
import locations from '../data/locations.json';

const unitsLocation = map(l => {
  const re = {
    en: trimEnd(replace(/(?:-{3}.*$)/, '', l.search_name_en)),
    ar: trimEnd(replace(/(?:-{3}.*$)/, '', l.search_name_ar))
  };
  return set('readable_location', re, l);
})(locations);

const us = map(u => {
  const locAr = get('clusters.locations[0]', u);
  const loc = find({search_name_ar: locAr})(unitsLocation);
  return set('location_info', loc, u);
})(units);


export const list = (b) => {
  console.time('list');
  const fs = pickBy(identity, b);
  const page = fs.page - 1 || 0;

  return filter(fs, us)  // eslint-disable-line
    .then(d => {
      console.timeEnd('list');
      return {
        stats: {
          total: size(units),
          current: size(d),
          page: page + 1,
        },
        units: d.slice(page * 50, (page * 50) + 50),
      };
    });
};

export const findunit = b => {
  console.log('finding unit ', b);
  const uid = b;
  console.log(uid);
  const i = find(u => u.aid === uid)(units);
  return Promise.resolve(i || {});
};

export default {
  list,
  findunit
};
