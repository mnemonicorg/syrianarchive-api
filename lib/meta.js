import Promise from 'bluebird';
import meta from '../data/meta.json';

export const list = () => Promise.resolve(meta);

export default {
  list,
};
