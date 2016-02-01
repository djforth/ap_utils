var _           = require('lodash')
  , chokidar    = require("chokidar")


var getName =  function(path){
  return _.last(path.split("/"));
}

module.exports = function(input, change, add){
  console.log('watching', input);
  var watcher = chokidar.watch(input, {
    persistent: true
  });

  watcher.on('change', function(path, stats) {
    console.log('File %j has been changed', getName(path));

    if(_.isFunction(change)){
      change(getName(path), path)
    }
  })
  .on('error', function(error) { console.log('Error happened: %j', error); })
  .on('add', function(path) {
    console.log('File %j has been added to watcher', getName(path));
    if(_.isFunction(add)){
      add(getName(path), path)
    }
  })

  return watcher;
}
