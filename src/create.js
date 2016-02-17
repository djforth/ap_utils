var fs       = require('fs')
  , _        = require('lodash')
  , mkdirp   = require('mkdirp')
  , readdirp = require('readdirp')
  , path     = require('path')
  , es       = require('event-stream');

export.file = function(path, data, cb){
  fs.writeFile(path, data, function(err) {
      if(err) {
          return console.error(err);
      }

      if(_.isFunction(cb)) cb(path)
      console.log(path + " updated");
  });
};

export.folder = function(path, done){
  // console.log('paths', done);
  mkdirp(path, function (err) {
      if (err) console.error(err)
      else {
        if(_.isFunction(done)) done(err);
        console.log(path + " created");
      }
  });
};