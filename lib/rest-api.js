/* eslint no-param-reassign: ["error", { "props": false }]*/
import express from 'express';

import {units} from './apps';

const app = express();

app.use('/units', units);

export default app;
