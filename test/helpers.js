import chai from 'chai';
import {curry, flow, reduce, concat, initial, split, uniq, merge,
        isEqual} from 'lodash/fp';
import mock from 'mock-fs';
import {existsSync, readFileSync} from 'fs';
import {random, tuple, nearray, nestring} from 'jsverify';
import filenamify from 'filenamify';
import {basename, dirname, join} from 'path';

chai.should();

// Filesystem specific assertions.
export const assertPath = existsSync;
export const assertFile = curry((f, data) =>
  assertPath(f) && isEqual(readFileSync(f).toString(), data));
export const assertJsonFile = curry((f, data) =>
  assertFile(f, JSON.stringify(data)));

// Make path.join take an array as argument.
const pJoin = xs => join(...(concat(['/'], xs)));

// Some helper functions to construct dir and file name arbitraries.
const sanitize = s => filenamify(s, {replacement: 'x'}).replace(/\./g, 'x');
const pathify = pJoin;
const unpathify = split('/');
const unfilify = p => {
  const [path, name] = [dirname(p), basename(p)];
  if (path === '/') return ['/', name];
  return [flow([unpathify, initial, pathify])(path), name];
};

// Arbitraries to be used as generators to test properties.
export const segmentArb = nestring.smap(sanitize, nestring.shrink);
export const pathArb = nearray(segmentArb).smap(pathify, unpathify);
export const fileArb = tuple([pathArb, segmentArb]).smap(pathify, unfilify);

export const constructFs = flow([
  uniq,
  reduce(([fs, ps], p) => {
    switch (random(0, 1)) {
      case 0: return [merge(fs, {[p]: ''}), ps];
      default: return [fs, merge(ps, {[p]: {}})];
    }
  }, [{}, {}]),
]);

// A hook to mock the file system
export const fsHook = fn =>
  (...args) => {
    mock();
    return fn(...args).tap(mock.restore);
  };
