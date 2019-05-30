'use strict';
let mongoProxy = require('./mongo-proxy')();

exports.post = function (collection, data) {
  let req = {
    headers: {
      connection: 'keep-alive',
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json;charset=UTF-8',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.9'
    },
    url: 'databases/ekwg/collections/' + collection,
    params: {collection: collection},
    method: 'POST',
    body: data
  };
  let res = {
    send: function (data) {
    },
    end: function (data) {
    },
    header: function (data) {
    }
  };
  mongoProxy(req, res);
};
