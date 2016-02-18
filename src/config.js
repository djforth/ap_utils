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
  if(assets.assets_in && !_.has(config, "input")) {
    config.input = path.resolve(assets.assets_in, type);
  }

  if(assets.assets_out && !_.has(config, "output")) {
    config.output = path.resolve(assets.assets_out);
  }

  return config;
}

module.exports = function(defaults, asset){
  var config = {}
  var ip, op;
  var pckage = require(path.resolve("./package.json"));

  if(pckage.assets){
    config = _.defaults(buildConfig(pckage.assets, asset), defaults);
    ip = pckage.assets.assets_in;
    op = pckage.assets.assets_out;
  }


  obj = {
      addInput:function(input){
        if(_.isUndefined(ip)) return obj
        if(config.input === path.resolve(ip, asset)){
          config.input = path.resolve(ip, input);
        }
      return obj;
    }
    , addOutput:function(output){
      if(_.isUndefined(op)) return obj
      if(config.output === path.resolve(op)){
        config.output = path.resolve(op, output);
      }
      return obj;
    }
    , get: function(key){
      return config[key]
    }
    , set:function(key, value){
      config[key] = value;
    }
  }

  return obj;
};