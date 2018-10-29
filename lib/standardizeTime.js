import {set} from 'lodash/fp';
import moment from 'moment';

export const fixIncidentTime = (u, k, v) => set(k, moment(v), u);

export default {fixIncidentTime};
