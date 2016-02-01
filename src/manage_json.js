var _        = require('lodash')
 , folder    = require('./folder_helpers')
 , fs        = require('fs')
 , path      = require('path');


function prepJson(json) {
   var process_json = {}
   _.forEach(json, function(j){
     process_json[j.key] = j.value
   });
   return process_json;
 }

function prepData(json){
 var data = []
 var regex  = new RegExp(/^images\//);
 _.forEach(json, function(j){
   var original = j.key.replace(regex, "");
   var file     = j.value.replace(regex, "")
   data.push({original:original, file:file})
 })
 return data
}

function parseJson(json){
  parsed = []
  _.forIn(JSON.parse(json.toString()), function(v, k){
    parsed.push({key:k, value:v});
  });

  return parsed;
}

module.exports = function(fp) {
  return {
    readJSON:function(success, error){
      fs.readFile(fp, (err, data) => {
        if (err) {
          console.error(err);
          if(_.isFunction(error)) error(data);
          return;
        }
        // console.log(data);
        if(_.isFunction(success))
            success(parseJson(data));
      });
    }

    , writeJSON:function(json, success, error){

      var preped = prepJson(json);

      fs.writeFile(fp, JSON.stringify(preped), function (err) {
        if (err) {
          console.error(err);
          if(_.isFunction(error)) error(data);
          return;
        }

        if(_.isFunction(success)) success();
      });
    }
  }

}