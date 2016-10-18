var fs       = require('fs')
    , path   = require('path');
var _        = require('lodash')
  , es       = require('event-stream');
var create   = require('./create')
  , read     = require('./read');

function createDone(callback){
  var cbCalled = false;
  return function(err){
    if (!cbCalled){
      if (_.isFunction(callback)) callback(err);
      cbCalled = true;
    }
  };
}

function pathManager(root){
  return function(folder){
    return path.resolve(root, folder);
  };
}

function copyFile(source, target){
  var done, read, write;

  var obj = {
    from: function(source){
      read = fs.createReadStream(source);
      read.on('error', function(err){
        done(err);
      });

      return obj;
    }
    , to: function(target){
      write = fs.createWriteStream(target);
      write.on('error', function(err){
        done(err);
      });

      return obj;
    }

    , copy: function(callback){
      done = createDone(callback);

      if (read && write){
        write.on('finish', function(){
          done();
        });

        read.pipe(write);
        write.end();
      }
      return obj;
    }
  };

  if (source) obj.from(source);
  if (target) obj.to(target);

  return obj;
}

function moveFile(from, to){
  copyFile()
    .from(from)
    .to(to)
    .copy(function(err){
      if (err) console.error(err);
    });
}

function copyFolder(){
  var done, pathresolve, readSt, writeSt;
  var obj = {
    from: function(from, ext){
      readSt = read(from, ext);
      return obj;
    }
    , to: function(to){
      create.folder(to); // Creates folder if doesn't exist
      pathresolve = pathManager(to);
      writeSt = es.writeArray(function(err, array){
        if (err) console.warn(err);
        _.forEach(array, function(entry){
          moveFile(entry.fullPath, pathresolve(entry.path));
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
          var ps = this.pause();

          create.folder(pathresolve(entry.parentDir)
            , function(){
              ps.resume();
            }
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
