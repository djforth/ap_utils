var fs       = require('fs')
    , path   = require('path');
var _        = require('lodash')
  , es       = require('event-stream');
var create   = require('./create')
  , read     = require('./read');

function createDone(callback) {
  var cbCalled = false;
  return function(err){
    if (!cbCalled){
      if (_.isFunction(callback)) callback(err);
      cbCalled = true;
    }
  };
}

function pathManager(root){
  return function(path){
    return path.resolve(root, path);
  };
}

function copyFile(source, target) {
  var done, read, write;

  var obj = {
    from: function(source){
      read = fs.createReadStream(source);
      read.on('error', function(err) {
        done(err);
      });

      return obj;
    }
    , to: function(target){
      write = fs.createWriteStream(target);
      write.on('error', function(err){
        done(err);
      });
      write.on('close', function(){
        done();
      });

      return obj;
    }

    , copy: function(callback){
      done = createDone(callback);
      if (read && write) read.pipe(write);
      return obj;
    }
  };

  if(source) obj.from(source);
  if(target) obj.to(target);

  return obj;
}

function copyFolder(){
  var done, path, readSt, writeSt;
  function moveFile(from, to){
    copyFile()
      .from(from)
      .to(to)
      .copy(function(err){
        if (err) console.error(err);
      });
  }

  var obj = {
    from: function(from, ext){
      readSt = read(from, ext);
    }
    , to: function(to){
      create.folder(to); // Creates folder if doesn't exist
      path = pathManager(to);
      writeSt = es.writeArray(function(err, array){
        if (err) console.warn(err);
        _.forEach(array, function(entry){
          copyFile()
            .from(entry.fullPath)
            .to(path(entry.path))
            .copy(function(err){
              if (err) console.warn(err);
            });
        });

        done();
      });
      return obj;
    }
    , copy: function(callback){
      done = createDone(callback);

      readSt
      .pipe(es.through(function(entry){
        this.emit('data', entry);
        if (!_.isEmpty(entry.parentDir)){
          this.pause();
          create.folder(path(entry.parentDir)
            , function(){
              this.resume();
            }.bind(this)
          );
        }
        return entry;
      },
      function end(){ // optional
        this.emit('end');
      }))
      .pipe(writeSt);
      return obj;
    }
  };

  return obj;
}

module.exports = {
  file: copyFile
  , folder: copyFolder
};
