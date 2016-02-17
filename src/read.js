var fs       = require('fs')
  , _        = require('lodash')
  , mkdirp   = require('mkdirp')
  , readdirp = require('readdirp')
  , path     = require('path')
  , es       = require('event-stream');

module.export = function(original, fileFilter){
  var stream = readdirp({ root: original, fileFilter: fileFilter });
  stream
    .on('warn', function (err) {
      console.error('non-fatal error', err);
    })
    .on('error', function (err) { console.error('fatal error', err); });

    return stream;
};
