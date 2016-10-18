var path = require('path');
var fs = require('fs');
var _ = require('lodash');

function fileExists(file){
  try {
    fs.accessSync(path.resolve(file), fs.F_OK);
    return true;
  } catch (e){
    return false;
  }
}

function getAPConfig(){
  var config_path = path.resolve('./.apconfig');
  return JSON.parse(fs.readFileSync(config_path, 'utf8'));
}

function getPackageConfig(){
  var config_path = path.resolve('./package.json');
  var data = JSON.parse(fs.readFileSync(config_path, 'utf8'));
  if (!_.has(data, 'assets')){
    console.warn('No Assets configuration');
    return {};
  }
  return data.assets;
}

module.exports = function(){
  if (fileExists('./.apconfig')){
    return getAPConfig();
  }

  return getPackageConfig();
};
