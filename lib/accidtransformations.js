import {map, merge, flow, getOr, find, set, get, replace, compact, reverse, sortBy, trimEnd} from 'lodash/fp';
import {fixIncidentTime} from './standardizeTime';

import locations from '../data/locations.json';

const unitsLocation = map(l => {
  const re = {
    en: trimEnd(replace(/(?:-{3}.*$)/, '', l.search_name_en)),
    ar: trimEnd(replace(/(?:-{3}.*$)/, '', l.search_name_ar))
  };
  return set('readable_location', re, l);
})(locations);

const addHumanLocation = map(u => {
  const locAr = get('clusters.locations[0]', u);
  const loc = find({search_name_ar: locAr})(unitsLocation);
  return set('location_info', loc, u);
});

const fixTime = map(u => fixIncidentTime(u, 'annotations.incident_date', u.annotations.incident_date));

const addSearchable = map(i => merge(i, {
  searchable: `${i.annotations.title_en}
  ${i.annotations.title_ar}
  ${i.annotations.summary_en}
  ${i.annotations.summary_ar}
  ${i.annotations.incident_code}
  ${i.annotations.incident_date}`,
}));

const compactCluster = map(i =>
  set('cluster', compact(i.cluster), i)
);

const addLatLon = map(i =>
  merge(i, {
    units: i.cluster,
    lat: !(getOr(false, 'annotations.latitude', i))
      ? getOr(undefined, 'lat', find(z => z.search_name_ar === get('clusters.locations.0', i), locations))
      : i.annotations.latitude,
    lon: !(getOr(false, 'annotations.longitude', i))
      ? getOr(undefined, 'lon', find(z => z.search_name_ar === get('clusters.locations.0', i), locations))
      : i.annotations.longitude,
    incident_code: i.id
  })
);

const addReferenceCode = map(i => merge(i, {
  reference_code: i.aid.substr(0, 7)
}));

const newestFirst = us => reverse(sortBy('annotations.incident_date', us));

export const transform = us => flow([
  addHumanLocation,
  addSearchable,
  compactCluster,
  addLatLon,
  addReferenceCode,
  fixTime,
  newestFirst
])(us);


export default {
  transform
};
