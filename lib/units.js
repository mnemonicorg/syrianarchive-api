import Promise from 'bluebird';
import {filter, partial, keys, map, flow, intersection, identity, pickBy, size, merge, sortBy, reverse} from 'lodash/fp';
// import Fuse from 'fuse.js';
import fuzzy from 'fuzzy';

import units from '../units.json';

const filters = {
  after: (d, us) => filter(u => u.incident_date > d)(us),
  before: (d, us) => filter(u => u.incident_date < d)(us),
  type_of_violation: (d, us) => filter(u =>
    u.type_of_violation[d] === 'TRUE' || u.type_of_violation[d] === true
  )(us)
};

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
    // const options = {
    //   toxenize: true,
    //   matchAllTokens: true,
    //   threshold: 0.1,
    //   maxPatternLength: 32,
    //   shouldSort: true,
    //   keys: [
    //     'searchable'
    //   ]
    // };
    // const fuse = new Fuse(units, options);
    // uu = fuse.search(term);
    const options = {
      pre: '<b>',
      post: '</b>',
      extract: (el) => el.searchable
    };

    const rs2 = fuzzy.filter(term, units, options);

    const rsd = reverse(sortBy('score', rs2));
    uu = map(u => merge(u.original, {searchresult: u.string}), rsd);
  } else {
    uu = units;
  }

  return Promise.resolve(flow(funcs)(uu))  // eslint-disable-line
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

export default {
  list,
};
