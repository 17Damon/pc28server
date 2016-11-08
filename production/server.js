'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _apolloServer = require('apollo-server');

var _graphql = require('graphql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * Created by zhubg on 2016/10/17.
                                                                                                                                                           */

// import cors from'cors';


//日期时间工具
var moment = require('moment');
//数据库
// var baseDao = require('./dao/base_dao');
var PORT = 3000;
var fetch = require('node-fetch');
var app = (0, _express2.default)();
//开启gzip
var compression = require('compression');

// compress all requests
app.use(compression());

// app.use('/manager',express.static(path.join(__dirname, '../admin')));
app.use(_express2.default.static(_path2.default.join(__dirname, '../dist')));

var corsOptions = {
    // origin: 'http://192.168.0.104:8989',
    origin: function origin(_origin, callback) {
        // var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        var originIsWhitelisted = true;
        callback(originIsWhitelisted ? null : 'Bad Request', originIsWhitelisted);
    },
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

var myGraphQLSchema = (0, _graphql.buildSchema)('\n  input MessageInput {\n    section: String\n    title: String\n    detail: String\n  }\n  \n  type Token {\n    token: String!\n  }\n  \n  type Message {\n    id: ID!\n    section: String\n    postingtime: String\n    title: String\n    detail: String\n\n  }\n  \n  type ItemList {\n    section: String!\n    list:[Message]\n  }\n\n  type Query {\n    getMessage(id: ID!): Message\n    checkUser(id: ID!,name:String!,password:String!): Token\n    getItemList(section:String!): ItemList\n  }\n\n  type Mutation {\n    createMessage(token: String,input:MessageInput): Token\n    updateMessage(id: ID!, input: MessageInput): Message\n  }\n');

// If Message had any complex fields, we'd put them on this object.

var Message = function Message(id, _ref) {
    var section = _ref.section;
    var postingtime = _ref.postingtime;
    var detail = _ref.detail;

    _classCallCheck(this, Message);

    this.id = id;
    this.section = section;
    this.postingtime = postingtime;
    this.title = title;
    this.detail = detail;
};

var ItemList = function ItemList(section, list) {
    _classCallCheck(this, ItemList);

    this.section = section;
    this.list = list;
};

var Token = function Token(token) {
    _classCallCheck(this, Token);

    this.token = token;
};

var root = {
    getMessage: function getMessage(_ref2) {
        var id = _ref2.id;

        // if (!fakeDatabase[id]) {
        //     throw new Error('no message exists with id ' + id);
        // }
        var params = {};
        params.id = id;
        return baseDao('item', 'getItemById', params).then(function (obj) {
            console.log(obj);
            return new Message(id, obj[0]);
        }).catch(function (e) {
            console.log(e);
        });
    },
    checkUser: function checkUser(_ref3) {
        var id = _ref3.id;
        var name = _ref3.name;
        var password = _ref3.password;

        // if (!fakeDatabase[id]) {
        //     throw new Error('no message exists with id ' + id);
        // }
        var token = require('crypto').randomBytes(10).toString('hex');
        var params = {};
        params.id = id;
        return baseDao('user', 'getUserById', params).then(function (obj) {
            if (obj[0].name === name && obj[0].password === password) {
                params.token = token;
                return baseDao('user', 'updateTokenById', params).then(function (obj) {
                    return new Token(obj[0].publishtoken);
                }).catch(function (e) {
                    console.log(e);
                });
                // return new Token(token);
            } else {
                return new Token('PermissionFailed');
            }
            // return new Token(token);
        }).catch(function (e) {
            console.log(e);
        });
    },
    getItemList: function getItemList(_ref4) {
        var section = _ref4.section;

        var params = {};
        params.section = section;
        return baseDao('item', 'getListBySection', params).then(function (obj) {
            return new ItemList(section, obj);
        }).catch(function (e) {
            console.log(e);
        });
    },
    createMessage: function createMessage(_ref5) {
        var token = _ref5.token;
        var input = _ref5.input;

        // Create a random id for our "database".
        var params = {};
        // fakeDatabase[id] = input;
        params.id = 'manager';
        return baseDao('user', 'getUserById', params).then(function (obj) {
            if (obj[0].publishtoken === token) {
                var id = require('crypto').randomBytes(10).toString('hex');
                var now = moment().format();
                params.item = input;
                params.item.id = id;
                params.item.postingtime = now;
                return baseDao('item', 'insert', params).then(function (obj) {
                    return new Token('RightToken');
                }).catch(function (e) {
                    console.log(e);
                });
            } else {
                return new Token('ViolationToken');
            }
        }).catch(function (e) {
            console.log(e);
        });
    },
    updateMessage: function updateMessage(_ref6) {
        var id = _ref6.id;
        var input = _ref6.input;

        if (!fakeDatabase[id]) {
            throw new Error('no message exists with id ' + id);
        }
        // This replaces all old data, but some apps might want partial update.
        fakeDatabase[id] = input;
        return new Message(id, input);
    }
};

// app.get('/test', function (req, res, next) {
//     // res.redirect('https://github.com/miss61008596');
//     fetch('http://localhost:3000/graphql', {
//         method: 'POST',
//         body: JSON.stringify(
//             {
//                 "query":`mutation {
//                               createMessage(
//                                     token:"c73d7c821f0eafd9e482",
//                                     input:{
//                                         section: "1234",
//                                         title: "1234",
//                                         detail: "1234"
//                                     }
//                               ) {
//                                 token
//                               }
//                             }`
//             }
//         ),
//         headers: {'Content-Type': 'application/json'}
//     })
//         .then(function (res) {
//             return res.json();
//         }).then(function (json) {
//         console.log(json);
//         res.send(json);
//     });
// });

// app.use('/graphql',bodyParser.json(), apolloExpress({
//     schema: myGraphQLSchema,
//     rootValue: root
// }));

// app.use('/graphql', cors(corsOptions) ,bodyParser.json(), apolloExpress({
//     schema: myGraphQLSchema,
//     rootValue: root
// }));

app.listen(PORT, function () {
    console.log('Running a GraphQL API server at localhost:3000/graphql');
});

// app.use('/graphql', cors(corsOptions) ,bodyParser.json(), apolloExpress({
//     schema: myGraphQLSchema,
//     rootValue: root
// }));


// {
//     "query": `mutation {
//                               createMessage(input: {
//                                 author: "andy",
//                                 content: "hope is a good thing",
//                               }) {
//                                 id
//                               }
//                             }`
// }


// app.get('/mine', function (req, res, next) {
//     // res.redirect('https://github.com/miss61008596');
//     res.send(`<html>
// <body>
// <div style="display: flex;flex-direction: row;justify-content: center;align-items: center">
// <div style="display: flex">
// <img style="width: 160px;height: 160px;border-radius: 80px;margin-right: 20px" src="https://avatars2.githubusercontent.com/u/6361237?v=3&s=466" />
// </div>
// <div style="display: flex;flex-direction: column;">
// <h1>个人技术分享</h1>
// <h1>请访问我的github主页</h1><a href="https://github.com/miss61008596">https://github.com/miss61008596</a>
// <h5>QQ:61008596</h5>
// </div>
// </div>
// </body>
// </html>`);
// });