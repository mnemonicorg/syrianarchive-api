import Promise from 'bluebird';
import {filter, partial, keys, map, flow, intersection, identity, pickBy, size, merge, orderBy, reduce, concat, curry, isEqual, keyBy, xor, take, find} from 'lodash/fp';
import fuzzy from 'fuzzy';

import is from '../data/incidents.json';

const units = map(i => merge(i, {
  searchable: `${i.title_en} ${i.title_ar} ${i.summary_en} ${i.summary_ar} ${i.incident_code} ${i.incident_date}`
}))(is);

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

const topdogs = (us) => take(100, orderBy(['score', 'original.incident_date'], ['desc', 'desc'], us));

const search = (term, us) => {
  const options = {
    pre: '<b>',
    post: '</b>',
    extract: (el) => el.searchable
  };
  const ts = term.split(' ');
  console.log(ts, '--------------');

  const rs = reduce(
    (a, t) => {
      const ff = fuzzy.filter(t, us, options);
      return concatManyWith('original.incident_code', isEqual, mg, a, ff);
    }
  , [])(ts);

  return map(u => merge(u.original, {searchresult: u.string}), topdogs(rs));
};

const filters = {
  after: (d, us) => filter(u => u.incident_date > d)(us),
  before: (d, us) => filter(u => u.incident_date < d)(us),
  weapons_used: (d, us) => filter(u => u.weapons_used.includes(d))(us),
  collection: (d, us) => filter(u => u.collections.includes(d))(us),
  location: (d, us) => filter(u => u.location === d)(us),
  type_of_violation: (d, us) => filter(u =>
    u.type_of_violation[d] === 'TRUE' || u.type_of_violation[d] === true
  )(us),
  term: (d, us) => search(d, us)
};

export const list = (b) => {
  console.time('list');
  const fs = pickBy(identity, b);
  const ks = keys(fs);
  console.log(fs);
  const page = fs.page - 1 || 0;

  const funcs = map(k => // eslint-disable-line
    partial(filters[k], [fs[k]])
  , intersection(ks, keys(filters)));

  const us = units;

  return Promise.resolve(flow(funcs)(us))  // eslint-disable-line
    .then(d => {
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
  console.log('finding ', b);
  return Promise.resolve(find(u => u.incident_code === b)(units));
};

export default {
  list,
  findunit
};
