import Promise from 'bluebird';
import {filter, partial, keys, map, flow, intersection, identity, pickBy} from 'lodash/fp';
import Fuse from 'fuse.js';

import units from '../units.json';

const filters = {
  after: (d, us) => filter(u => u.dem.incident_date > d)(us),
  before: (d, us) => filter(u => u.dem.incident_date < d)(us),
  type_of_violation: (d, us) => filter(u =>
    u.dem.type_of_violation[d] === 'TRUE' || u.dem.type_of_violation[d] === true
  )(us)
};

const mapU = u => u.dem;

const convertUs = map(mapU);

export const list = (b) => {
  console.log(b);
  const fs = pickBy(identity, b);
  console.log(fs);
  console.time('list');
  const ks = keys(fs);
  console.log(fs);
  const term = fs.term || '';
  const page = fs.page - 1 || 0;

  const funcs = map(k => // eslint-disable-line
    partial(filters[k], [fs[k]])
  , intersection(ks, keys(filters)));

  let uu = [];
  if (term) {
    const options = {
      threshold: 0.2,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 4,
      keys: [
        'online_title',
        'online_title',
        'online_title_ar',
        'online_title_en',
        'description',
        'summary_en',
        'summary_ar',
        'channel_id',
        'notes',
        'keywords'
      ]
    };
    const fuse = new Fuse(convertUs(units), options);
    uu = fuse.search(term);
  } else {
    uu = convertUs(units);
  }

  return Promise.resolve(flow(funcs)(uu))  // eslint-disable-line
    .then(d => {
      console.timeEnd('list');
      return d.slice(page * 50, (page * 50) + 50);
    });
};

export default {
  list,
};
