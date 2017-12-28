import http from 'http';
import winston from 'winston';
import logger from 'express-winston';
import errorHandler from 'errorhandler';

import app from './app';
// Instantiate the server
const server = http.createServer(app);

// When true, do a graceful shutdown by refusing new incoming requests.
let gracefullyClosing = false;

// Configure our node app for all environments
app.set('port', process.env.LF_API_PORT || 8000);

switch (app.get('env')) {
  case 'development':
  case 'staging': {
    app.use(errorHandler());
    break;
  }
  default: { break; }
}

// Setup logging.
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {timestamp: true, colorize: true});

app.use(logger.logger({
  transports: [new winston.transports.Console({colorize: true})],
  expressFormat: true,
  colorStatus: true,
}));

// Middleware for graceful shutdowns
app.use((req, res, next) => {
  if (!gracefullyClosing) {
    next();
  } else {
    res.setHeader('Connection', 'close');
    res.status(502).send();
  }
});

app.use(logger.errorLogger({
  transports: [new winston.transports.Console({json: true, colorize: true})],
}));

// Start the HTTP server
const httpServer = server.listen(app.get('port'));

httpServer.on('listening', () =>
  winston.info(`Server started on port ${app.get('port')}`));

// Gracefully shutdown on SIGTERM
// This might not work very well with websockets.
process.on('SIGTERM', () => {
  gracefullyClosing = true;
  winston.info('Received kill signal (SIGTERM), shutting down gracefully.');

  // waiting for existing connections to close and exit the process
  httpServer.close(() => {
    winston.info('Closed out remaining connections.');
    process.exit();
  });

  setTimeout(() => {
    winston.error('Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 30 * 1000);
});

process.on('uncaughtException', (err) =>
  winston.error('uncaught exception', err, err.stack));
