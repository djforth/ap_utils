var _           = require('lodash')
  , chokidar    = require('chokidar');

var getName =  function(path){
  return _.last(path.split('/'));
};

module.exports = function(input){
  console.log('watching', input);
  var watcher = chokidar.watch(input, {
    ignored: /[\/\\]\./
  });
  watcher.on('error', function(error){
    console.log('Error happened: %j', error);
  });

  var obj = {
    addChange: function(fn){
      if (!_.isFunction(fn)) return obj;
      watcher.on('change', function(path){
        console.log('File %j has been changed', getName(path));
        fn(getName(path), path);
      });

      return obj;
    }
    , onAdd: function(fn){
      if (!_.isFunction(fn)) return obj;

      watcher.on('add', function(path){
        console.log('File %j has been added to watcher', getName(path));
        fn(getName(path), path);
      });

      return obj;
    }
  };

  return obj;
};
