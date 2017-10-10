import express from 'express';

import {list} from '../meta';

const router = express.Router();


router.get('/', (req, res) =>
  list(req.body).then(prs => res.send(prs)));

router.post('/', (req, res) =>
  list(req.body).then(prs => res.send(prs)));

export default router;
