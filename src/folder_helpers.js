var fs       = require('fs')
  , _        = require('lodash')
  , mkdirp   = require('mkdirp')
  , readdirp = require('readdirp')
  , path     = require('path')
  , es       = require('event-stream');

var getFiles = function(original, fileFilter){
  console.log("getting files", original)
  // console.log(original, fileFilter)
  var stream = readdirp({ root: original, fileFilter: fileFilter });
  // console.log(stream)
  stream
    .on('warn', function (err) {
      console.error('non-fatal error', err);
    })
    // .on('data', function(d){console.log(d)})
    .on('error', function (err) { console.error('fatal error', err); });

    return stream;
}

var createFile = function(path, data, cb){
  // console.log("file", path)
  fs.writeFile(path, data, function(err) {
      if(err) {
          return console.error(err);
      }

      if(_.isFunction(cb)) cb(path)
      console.log(path + " updated");
  });
};

var createFolder = function(path, done){
  // console.log('paths', done);
  mkdirp(path, function (err) {
      if (err) console.error(err)
      else {
        if(_.isFunction(done))
          done(err);

        console.log(path + " created");
      }
  });
};

var copyFile = function(source, target, cb) {
  var cbCalled = false;
  // console.log(source, target
  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}



var copyFolder = function(original, newFolder, fileFilter, callback){
  createFolder(newFolder);

  function moveFile(entry, path){
    copyFile(entry.fullPath, path + "/" + entry.path, function(err){
      if(err){
        console.error(err)
      }
    })
  }

  function createNewFolder(entry, path, done){
    createFolder(path + "/" + entry.parentDir, function(err){
      if(err){
        console.error(err)
      } else {
        console.log('success');
        if(_.isFunction(done)){
          done();
        }
      }
    });
  }

  var writer = es.writeArray(function(err, array){
    _.forEach(array, function(files){
      moveFile(files, newFolder);
    })

    callback()
  })

  var stream = getFiles(original, fileFilter);

  stream
    .pipe(es.through(function(entry){
      this.emit('data', entry)
      if(!_.isEmpty(entry.parentDir)){
        this.pause()
        createNewFolder(entry, newFolder, function(){
          this.resume();
        }.bind(this));
      }

      return entry
    },
    function end () { //optional
      this.emit('end')
    }))
    .pipe(writer);
}

var clearFolder = function(folder, fileFilter, cb, rm){
  rm = rm || false;
  var stream = getFiles(folder, fileFilter);

  stream
    .on("end", function(d){
      if(_.isFunction(cb)){
        cb();
      }
    })
    .pipe(
      es.mapSync(function (entry) {
        // console.log("CLEARING", entry.fullPath)
        fs.unlinkSync(entry.fullPath);
        return entry.fullPath;
      })
    );

  if(rm){
    fs.rmdirSync(folder)
  }
}






module.exports = {
    clearFolder : clearFolder
  , copyFile    : copyFile
  , copyFolder  : copyFolder
  , file        : createFile
  , folder      : createFolder
  , getFiles    : getFiles
  , removeFile  : function(path){
    fs.unlinkSync(path);
  }

};
