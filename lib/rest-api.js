/* eslint no-param-reassign: ["error", { "props": false }] */
import express from 'express';

import {units, meta, pattrn} from './apps';

const app = express();

app.use('/units', units);
app.use('/meta', meta);
app.use('/data', pattrn);

export default app;
