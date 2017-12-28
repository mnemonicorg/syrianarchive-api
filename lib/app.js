import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import api from './rest-api';

// Instantiate the app
const app = express();

app.locals = {
  port: process.env.LF_API_PORT || 6667,
};

// Configure our node app for all environments
app.set('port', process.env.LF_API_PORT || 6667);
app.use(cors());
// Parse the body as JSON
app.use(bodyParser.json());

app.use('/', api);

export default app;
