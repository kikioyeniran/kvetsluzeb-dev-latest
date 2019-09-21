import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import logger from 'morgan';
import path from 'path';
import expressValidator from 'express-validator';

import fs from 'fs';

if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'));
  fs.mkdirSync(path.join(__dirname, 'public/uploads'))
}
//ng the config and routes folders
import config from './config';
import routes from './routes'

const PORT =process.env.PORT||8080;
// importites from './routes';

let app = express();
app.server = http.createServer(app);

// middleware
// parse application/json
app.use(
  bodyParser.json({
    limit: process.env.BODYLIMIT
  })
);
app.use(bodyParser.urlencoded({ extended: false }));

// setting public folder
app.use(express.static(path.join(__dirname, '../public')));
console.log(path.join(__dirname, '../public'));
// morgan logger
app.use(logger('dev'));

// Express Validator Middleware
app.use(
  expressValidator({
    errorFormatter: (param, msg, value) => {
      var namespace = param.split('-'),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

// routes for API version 1
app.use('/api/v1', routes);

// app.server.listen(process.env.PORT);
app.server.listen(PORT);
// console.log(`started on port:${app.server.address().port}`);
console.log(`started on http://127.0.0.1:${PORT}`);

export default app;
