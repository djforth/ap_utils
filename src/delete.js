var _    = require('lodash');
var es   = require('event-stream');
var fs   = require('fs');
var read = require('./read');

exports.folder = function(folder, fileFilter){
  return function(cb, rmdir){
    var stream = read(folder, fileFilter);
    rmdir = _.isBoolean(rmdir) ? rmdir : false;
    stream
      .on('end', function(){
        if (_.isFunction(cb)) cb();
        if (rmdir) fs.rmdirSync(folder);
      })
      .pipe(
        es.mapSync(function(entry){
          fs.unlinkSync(entry.fullPath);
          return entry.fullPath;
        })
      );
  };
};

exports.file = function(path){
  fs.access(path, fs.constants.F_OK, function(e){
    if(!e){
      fs.unlinkSync(path);
    }
  });
};
