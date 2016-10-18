var fs       = require('fs');
var _        = require('lodash');
var mkdirp   = require('mkdirp');

exports.file = function(path, data, cb){
  fs.writeFile(path, data, function(err){
    if (err) return console.error(err);
    if (_.isFunction(cb)) cb(path);
    console.log(path + ' updated');
  });
};

exports.folder = function(path, done){
  mkdirp(path, function(err){
    if (err) console.error(err);
    else {
      if (_.isFunction(done)) done(err);
      console.log(path + ' created');
    }
  });
};
