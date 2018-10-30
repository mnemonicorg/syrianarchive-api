import {set, isNull} from 'lodash/fp';
import moment from 'moment';

export const fixIncidentTime = (u, k, v) => {
  const t = moment(v);
  const tt = isNull(t) ? undefined : t;
  return set(k, tt, u)
};

export default {fixIncidentTime};
