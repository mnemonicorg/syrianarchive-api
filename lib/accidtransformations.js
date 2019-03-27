import {map, merge, flow, getOr, set, compact, reverse, sortBy, omit} from 'lodash/fp';
import {fixIncidentTime} from './standardizeTime';

// import locations from '../data/locations.json';

// const unitsLocation = map(l => {
//   const re = {
//     en: trimEnd(replace(/(?:-{3}.*$)/, '', l.search_name_en)),
//     ar: trimEnd(replace(/(?:-{3}.*$)/, '', l.search_name_ar))
//   };
//   return set('readable_location', re, l);
// })(locations);

// const addHumanLocation = map(u => {
//   const locAr = get('clusters.locations[0]', u);
//   const loc = find({search_name_ar: locAr})(unitsLocation) || find({id: locAr})(unitsLocation);
//   return set('location_info', loc, u);
// });

const fixTime = map(u => fixIncidentTime(u, 'annotations.incident_date', u.annotations.incident_date));

const addSearchable = map(i => merge(i, {
  searchable: `${i.annotations.online_title_en}
  ${i.annotations.online_title_ar}
  ${i.annotations.summary_en}
  ${i.annotations.summary_ar}
  ${i.annotations.incident_code}
  ${i.annotations.incident_date}`,
}));

const omitSensitive = map(omit([
  'annotations.staff'
]));

const compactCluster = map(i =>
  set('cluster', compact(i.cluster), i)
);

const addLatLon = map(i =>
  merge(i, {
//    units: i.cluster,
    lat: !(getOr(false, 'annotations.latitude', i))
      ? getOr(undefined, 'location_info.lat', i)
      : Number(i.annotations.latitude),
    lon: !(getOr(false, 'annotations.longitude', i))
      ? getOr(undefined, 'location_info.lon', i)
      : Number(i.annotations.longitude),
//    incident_code: i.id
  })
);

const addReferenceCode = map(i => merge(i, {
  reference_code: i.aid.substr(0, 7)
}));

const newestFirst = us => reverse(sortBy('incident_date', us));

export const transform = us => flow([
//  addHumanLocation,
  addSearchable,
  compactCluster,
  addLatLon,
  addReferenceCode,
  omitSensitive,
  fixTime,
  newestFirst
])(us);


export default {
  transform
};
