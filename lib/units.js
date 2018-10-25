import Promise from 'bluebird';
import {identity, pickBy, size, find} from 'lodash/fp';

import {filter} from './filters';
import {transform} from './accidtransformations';

import units from '../data/units.json';

const us = transform(units);


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
