var fs       = require('fs')
  , _        = require('lodash')
  , create   = require('./create')
  , mkdirp   = require('mkdirp')
  , read     = require('./read')
  , readdirp = require('readdirp')
  , path     = require('path')
  , es       = require('event-stream');


function createDone(callback) {
  cbCalled = false;
  return function(err){
    if (!cbCalled) {
      if(_.isFunction(callback)) callback(err);
      cbCalled = true;
    }
  }
}

function pathManager(root){
  return function(path){
    return root + "/" + path;
  }
}


function copyFile(source, target) {
  var done, read, write;

  var obj = {
    from:function(source){
      read = fs.createReadStream(source);
      read.on("error", function(err) {
        done(err);
      });

      return obj
    }
    , to:function(target){
       write = fs.createWriteStream(target);
       write.on("error", function(err) {
          done(err);
        });
        write.on("close", function(ex) {
          done();
        });
    }

    , copy:function(callback){
      done = createDone(callback);
      if(read && write) rd.pipe(write);
    }
  }

  if(source) obj.from(source);
  if(target) obj.to(target)

  return object;
}


function copyFolder(){
  var done, path, readSt, writeSt;



  function moveFile(from, to){
    copyFile()
      .from(from)
      .to(to)
      .copy(function(err){
          if(err){
            console.error(err)
          }
        });
  }

  var obj = {
    from:function(from, ext){
      readSt = read(from, ext);
    }
    , to:function(to){
      create.folder(to); //Creates folder if doesn't exist
      path = pathManger(to);

      writeSt = es.writeArray(function(err, array){
        _.forEach(array, function(entry){
          moveFile(entry.fullPath, path(entry.path));
        });

        done();
      });
    }
    , copy:function(callback){
      done = createDone(callback);

      stream
        .pipe(es.through(function(entry){
          this.emit('data', entry)
          if(!_.isEmpty(entry.parentDir)){
            this.pause()
            create.folder(path(entry.parentDir)
              , function(){
                this.resume();
              }.bind(this)
            );

          }

          return entry
        },
        function end () { //optional
          this.emit('end')
        }))
        .pipe(writer);
    }
  }
}