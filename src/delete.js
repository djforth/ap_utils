var _        = require('lodash')
  , es   = require('event-stream')
  , fs   = require('fs')
  , read = require("./read");

exports.folder = function(folder, fileFilter){
  var stream = getFiles(folder, fileFilter);

  return function(cb, rmdir){
    rmdir = _.isBoolean(rmdir) ? rmdir : false;
    stream
      .on("end", function(d){
        if(_.isFunction(cb)) cb();
        if(rmdir) fs.rmdirSync(folder)
      })
      .pipe(
        es.mapSync(function (entry) {
          fs.unlinkSync(entry.fullPath);
          return entry.fullPath;
        })
      );
  }
}


exports.file = function(path){
  fs.unlinkSync(path);
}