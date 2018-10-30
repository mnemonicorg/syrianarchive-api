import {set} from 'lodash/fp';
import moment from 'moment';

export const fixIncidentTime = (u, k, v) => {
  if (!v) return set(k, undefined, u);
  const t = moment(v);
  console.log(t);
  const tt = !t.isValid() ? undefined : t;
  return set(k, tt, u);
};

export default {fixIncidentTime};
