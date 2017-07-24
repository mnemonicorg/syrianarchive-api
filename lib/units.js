import Promise from 'bluebird';
import {filter, partial, keys, map, flow, intersection, identity, pickBy, size, merge, sortBy, reverse, reduce, concat, curry, isEqual, keyBy, xor} from 'lodash/fp';
// import Fuse from 'fuse.js';
import fuzzy from 'fuzzy';

import units from '../units.json';

const concatManyWith = curry((idField, identical, merger, xs, ys) => {
  const x = keyBy(idField, xs);
  const y = keyBy(idField, ys);
  const kx = keys(x);
  const ky = keys(y);

  const same = intersection(kx, ky);
  const different = xor(kx, ky);

  const merged = map(id =>
    (identical(x[id], y[id]) ? x[id] : merger(x[id], y[id]))
  , same);

  const notmerged = map(id => x[id] || y[id], different);
  return concat(merged, notmerged);
});

const mg = (u, u2) => {
  const s = u.score;
  const s2 = u2.score;
  const j = merge(u, u2);
  j.score = s + s2;
  return j;
};


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
    const ts = term.split(' ');
    console.log(ts, '--------------');

    const rs = reduce(
      (a, t) => {
        const ff = fuzzy.filter(t, units, options);
        return concatManyWith('original.reference_code', isEqual, mg, a, ff);
      }
    , [])(ts);

    const rsd = reverse(sortBy('score', rs));
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
