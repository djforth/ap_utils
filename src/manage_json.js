var _        = require('lodash');
var fs        = require('fs');

function prepJson(json){
  var process_json = {};
  _.forEach(json, function(j){
    process_json[j.key] = j.value;
  });
  return process_json;
}

function parseJson(json){
  var parsed = [];
  _.forIn(JSON.parse(json.toString()), function(v, k){
    parsed.push({key: k, value: v});
  });

  return parsed;
}

module.exports = function(fp){
  return {
    read: function(success, error){
      fs.readFile(fp, function(err, data){
        if (err){
          if (_.isFunction(error)) error(err);
          return;
        }
        if (_.isFunction(success)){
          success(parseJson(data));
        }
      });
    }

    , write: function(json, success, error){
      var preped = prepJson(json);

      fs.writeFile(fp, JSON.stringify(preped), function(err){
        if (err){
          if (_.isFunction(error)) error(err);
          return;
        }

        if (_.isFunction(success)) success();
      });
    }
  };
};
