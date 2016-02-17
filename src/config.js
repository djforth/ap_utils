var _    = require("lodash")
  , path = require("path")


// function setPaths(key, def){
//   return function(path, obj){
//     obj[key] =(_.isUndefined(path)) ? def : path;
//     return obj;
//   }
// }

function buildConfig(assets, type){
  var config  = assets[type] || {}
  if(assets.assets_in && !_.has("input")) {
    config.input = path.resolve(assets.assets_in, type);
  }

  if(assets.assets_out && !_.has("output")) {
    config.output = path.resolve(pckage.assets.assets_out);
  }

  return config;
}

module.exports = function(defaults, asset){
  var config, input, output;
  var pckage = require(path.resolve("./package.json"));

  if(pckage.assets){
    config = _.defaults(buildConfig(pckage.assets, asset), defaults);
  }


  obj = {
      addInput:function(input){
        if(config.input === path.resolve(pckage.assets.assets_in, type)){
          config.input = path.resolve(pckage.assets.assets_in, input));
        }
      return obj;
    }
    , addOutput:function(output){
      if(config.output === path.resolve(pckage.assets.assets_out, type)){
        config.output = path.resolve(pckage.assets.assets_out, output));
      }
      return obj;
    }
    , get: function(key){
      return defaults[key]
    }
    , set:function(key, value){
      defaults[key] = value;
    }
  }

  return obj;
};