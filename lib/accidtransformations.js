import {map, merge, isEmpty, flow, getOr, find, set, get, replace, trimEnd} from 'lodash/fp';

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


const addSearchable = map(i => merge(i, {
  searchable: `${i.annotations.title_en}
  ${i.annotations.title_ar}
  ${i.annotations.summary_en}
  ${i.annotations.summary_ar}
  ${i.annotations.incident_code}
  ${i.annotations.incident_date}`,
}));

const addLatLon = map(i => merge(i, {
  units: i.cluster,
  lat: isEmpty(i.annotations.latitude)
    ? getOr(undefined, 'lat', find(z => z.search_name_ar === get('clusters.locations.0', i), locations))
    : i.annotations.latitude,
  lon: isEmpty(i.annotations.longitude)
    ? getOr(undefined, 'lon', find(z => z.search_name_ar === get('clusters.locations.0', i), locations))
    : i.annotations.longitude,
  incident_code: i.id
}));

export const transform = us => flow([
  addHumanLocation,
  addSearchable,
  addLatLon
])(us);


export default {
  transform
};
