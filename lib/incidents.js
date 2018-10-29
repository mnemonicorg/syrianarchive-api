import Promise from 'bluebird';
import {identity, pickBy, find, size, map} from 'lodash/fp';

import {filter, possibilities} from './filters';
import {transform} from './accidtransformations';
import {fixIncidentTime} from './standardizeTime';

import is from '../data/incidents.json';

const uss = transform(is);
const ps = possibilities(us);

const us = map(u => fixIncidentTime(u, 'annotations.standard_incident_date', u.annotations.incident_date))(uss);

export const list = (b) => {
  console.log('woohooo');
  console.log(b);
  console.time('list');
  const fs = pickBy(identity, b);
  console.log('filts');
  // console.log(fs);
  const page = fs.page - 1 || 0;

  return filter(fs, us)  // eslint-disable-line
    .then(d => {
      console.log('ppppp');
      console.log(size(us));
      console.log(size(d));
      console.timeEnd('list');
      return {
        stats: {
          total: size(us),
          current: size(d),
          page: page + 1,
        },
        possibilities: ps,
        units: d,
      };
    });
};

export const findunit = b => {
  console.log('finding incident ', b);
  const i = find(u => u.aid === b)(us) || find(u => u.incident_code === b, us);
  return Promise.resolve(i);
};

export default {
  list,
  findunit
};
