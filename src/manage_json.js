var _        = require('lodash');
var fs        = require('fs');

function parseJson(json){
  return JSON.parse(json.toString());
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
      // var preped = prepJson(json);

      fs.writeFile(fp, JSON.stringify(json), function(err){
        if (err){
          if (_.isFunction(error)) error(err);
          return;
        }

        if (_.isFunction(success)) success();
      });
    }
  };
};
