'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by zhubg on 2016/10/17.
 */
var PORT = 80;
var app = (0, _express2.default)();
//开启gzip
var compression = require('compression');

// compress all requests
app.use(compression());

// app.use('/manager',express.static(path.join(__dirname, '../admin')));
app.use(_express2.default.static(_path2.default.join(__dirname, '../dist')));

app.listen(PORT, function () {
  console.log('Running a GraphQL API server at localhost:3000/graphql');
});