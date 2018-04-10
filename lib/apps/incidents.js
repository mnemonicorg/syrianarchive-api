import express from 'express';

import {list, findunit} from '../incidents';

const router = express.Router();

/**
 * @api {get} /projects Request a list of projects.
 * @apiName ListProjects
 * @apiGroup Projects
 *
 * @apiSuccess {String[]} projects A list of projects.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     ['one', 'two']
 */

router.get('/:uid', (req, res) =>
  findunit(req.params.uid).then(prs => res.send(prs)));

router.get('/', (req, res) =>
  list(req.body).then(prs => res.send(prs)));

router.post('/', (req, res) =>
  list(req.body).then(prs => res.send(prs)));


export default router;
