import Promise from 'bluebird';
import meta from '../meta.json';

export const list = () => Promise.resolve(meta);

export default {
  list,
};
