var _ = require('lodash');
var sinon = require('sinon');
var Getter = require('./manager_helpers');

function createSpy(module){
  return function(title){
    var toSpy = module.__get__(title);

    var spy = sinon.spy(toSpy);
    // console.log(spy)
    // var revert = module.__set__(title, spy);
    return {
      spy, title, toSpy
    };
  };
}

function createSpyObj(module){
  return function({title, opts}){
    var toSpy = module.__get__(title);
    let spies = opts.map((opt)=>{
      return {
        spy: sinon.spy(toSpy, opt)
        , title: opt
      };
    });
    return {
      spies, title, toSpy
    };
  };
}

function resetter(spies, title, method){
  spies.forEach((spy)=>{
    if (!title && spy.spy){
      spy.spy.reset();
    } else if (title === spy.title){
      spy.spy.reset();
    } else if (title === spy.title && spy.spies){
      resetter(spy.spies, method);
    } else if (!title && spy.spies){
      resetter(spy.spies);
    }
  });
}

function restorer(spies, title, method){
  spies.forEach((spy)=>{
    if (!title && spy.spy){
      spy.toSpy.restore();
    } else if (title === spy.title){
      spy.toSpy.restore();
    } else if (title === spy.title && spy.spies){
      restorer(spy.spies, method);
    } else if (!title && spy.spies){
      restorer(spy.spies);
    }
  });
}

module.exports = function(module){
  var spies = [];
  var creator = createSpy(module);
  var creatorObj = createSpyObj(module);
  var obj = {
    add: function(list){
      list = (_.isArray(list)) ? list : [list];
      spies = list.map((li)=>{
        if(_.isPlainObject(li)){
          return creatorObj(li);
        }
        return creator(li);
      });
    }
    , get: function(title, method){
      var spy = Getter(spies, title);
      if (!spy) return null;
      if (!method) return spy.spy;
      return Getter(spy.spies, method).spy;
    }
    , reset: function(title, method){
      resetter(spies, title, method);
    }
    , restore: function(title, method){
      restorer(spies, title, method);
    }
  };

  return obj;
};
