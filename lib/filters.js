import Promise from 'bluebird';
import {
  filter as loFilter,
  isEmpty,
  getOr,
  partial,
  keys,
  map,
  flow,
  intersection,
  identity,
  pickBy,
  merge,
  orderBy,
  reduce,
  concat,
  curry,
  isEqual,
  keyBy,
  xor
} from 'lodash/fp';
import fuzzy from 'fuzzy';


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

const topdogs = (us) => loFilter(u => u.score > 10, orderBy(['score', 'original.incident_date'], ['desc', 'desc'], us));

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
      const ff = fuzzy.loFilter(t, us, options);
      return concatManyWith('original.incident_code', isEqual, mg, a, ff);
    }
  , [])(ts);

  return map(u => merge(u.original, {searchresult: u.string}), topdogs(rs));
};

const filters = {
  after: (d, us) => loFilter(u => u.annotations.incident_date > d)(us),
  before: (d, us) => loFilter(u => u.annotations.incident_date < d)(us),
  weapons_used: (d, us) => loFilter(u => u.clusters.weapons.includes(d))(us),
  collection: (d, us) => filter(u => getOr([], 'clusters.collections', u).includes(d))(us),
  collections: (d, us) => (isEmpty(d) ? us : loFilter(u => !isEmpty(intersection(d, getOr([], 'clusters.collections', u))))(us)),
  location: (d, us) => loFilter(u => u.clusters.location.includes(d))(us),
  type_of_violation: (d, us) => loFilter(u =>
    u.annotations.type_of_violation[d] === 'TRUE' || u.annotations.type_of_violation[d] === true
  )(us),
  term: (d, us) => search(d, us)
};


export const filter = (terms, units) => {
  const fs = pickBy(identity, terms);
  const ks = keys(fs);
  console.log(ks, fs);

  const funcs = map(k => // eslint-disable-line
    partial(filters[k], [fs[k]])
  , intersection(ks, keys(filters)));

  return Promise.resolve(flow(funcs)(units)); // eslint-disable-line
};


export default {
  filter
};
