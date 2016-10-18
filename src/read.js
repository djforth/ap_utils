var readdirp = require('readdirp');

module.exports = function(original, fileFilter){
  var stream = readdirp({root: original, fileFilter: fileFilter});
  stream
    .on('warn', function(err){
      console.error('non-fatal error', err);
    })
    .on('error', function(err){
      console.error('fatal error', err);
    });

  return stream;
};
