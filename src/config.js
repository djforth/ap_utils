var _    = require('lodash');
var path = require('path');

var getConfig = require('./get_config');

function buildConfig(assets, type){
  var config  = assets[type] || {};
  if (assets.assets_in && !_.has(config, 'input')){
    config.input = path.resolve(assets.assets_in, type);
  }

  if (assets.assets_out && !_.has(config, 'output')){
    config.output = path.resolve(assets.assets_out);
  }

  return config;
}

module.exports = function(defaults, asset){
  var ip, op, config, rootConfig;
  rootConfig = getConfig();
  config = _.defaults(buildConfig(rootConfig, asset), defaults);
  ip = rootConfig.input;
  op = rootConfig.output;

  var obj = {
    addInput: function(input){
      if (_.isUndefined(ip)) return obj;
      if (config.input === path.resolve(ip, asset)){
        config.input = path.resolve(ip, input);
      }
      return obj;
    }
    , addOutput: function(output){
      if (_.isUndefined(op)) return obj;
      if (config.output === path.resolve(op)){
        config.output = path.resolve(op, output);
      }
      return obj;
    }
    , get: function(key){
      return config[key];
    }
    , set: function(key, value){
      config[key] = value;
    }
  };

  return obj;
};
