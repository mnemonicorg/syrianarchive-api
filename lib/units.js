import Promise from 'bluebird';
import {identity, pickBy, size, find, map} from 'lodash/fp';

import {filter, possibilities} from './filters';
import {transform} from './accidtransformations';
import {fixIncidentTime} from './standardizeTime';

import units from '../data/units.json';

const uss = transform(units);
const ps = possibilities(us);

const us = map(u => fixIncidentTime(u, 'annotations.standard_incident_date', u.annotations.incident_date))(uss);

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
        possibilities: ps,
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
