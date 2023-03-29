import configFile from '../config.json';

const express = require('express');
const apiMocker = require('connect-api-mocker');

_env = configFile.ENVIRONMENT

_apiHost = configFile.API.HOST[this._env]
_apiContext = configFile.API.CONTEXT[this._env]

const port = 9000;
const app = express();

// Uncomment if not using create-react-app
const cors = require('cors');
app.use(cors());

app.use(_apiContext, apiMocker('mock-api'));
 
console.log(`Mock API Server is up and running at: ${_apiHost}:${port}`);
app.listen(port);