import express from 'express';

import data from '../../geounits.json';

const router = express.Router();


router.get('/data.geojson', (req, res) => {
  console.log('requesting pattrn data');
  res.send(data);
});


export default router;
