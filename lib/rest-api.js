/* eslint no-param-reassign: ["error", { "props": false }]*/
import express from 'express';

import {units, meta} from './apps';

const app = express();

app.use('/units', units);
app.use('/meta', meta);

export default app;
