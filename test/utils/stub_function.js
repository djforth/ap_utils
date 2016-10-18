var _ = require('lodash');
// _.isPlainObjecyt
var sinon = require('sinon');

function createStubWithReturn(returnValue){
  return sinon.stub().returns(returnValue);
}

function createStub(module){
  return function(opts){
    var title, stub;
    if (_.isString(opts)){
      title = opts;
      stub = sinon.stub();
    } else {
      title = opts[0];
      stub = createStubWithReturn(opts[1]);
    }
    var revert = module.__set__(title, stub);
    return {
      stub, revert, title
    };
  };
}

function createStubObj(module){
  return function(obj){
    var method = module.__get__(obj.title);
    let stubs = obj.opts.map((opt)=>{
      if (_.isString(opt)){
        return {
          title: opt
          , stub: sinon.stub(method, opt)
        };
      }
      return {
        title: opt[0]
        , stub: sinon.stub(method, opt[0], opt[1])
      };
    });
    return {
      stubs, obj, title: obj.title
    };
  };
}

function getter(stubs, title){
  let stub =  stubs.filter((stub)=>stub.title === title);
  return stub[0];
}

function restore(stub){
  if (stub.revert) stub.revert();
  if (stub.stubs){
    stub.stubs.forEach((st)=>{
      st.stub.restore();
    })
  }
}

module.exports = function(module){
  var stubs = [];
  var creator = createStub(module);
  var creatorObj = createStubObj(module);
  var obj = {
    add: function(list){
      list = (_.isArray(list)) ? list : [list];
      stubs = list.map((li)=>{
        if (_.isPlainObject(li)){
          return creatorObj(li);
        }
        return creator(li);
      });
    }
    , get: function(title, method){
      var stub = getter(stubs, title);
      if (method){
        stub = stub.stubs.filter((st)=>{          return st.title === method;
        })[0];
      }

      return stub.stub;
    }
    , reset: function(title){
      if (title){
        var stub = getter(stubs, title);
        stub.stub.reset();
      } else {
        stubs.forEach((stub)=>{
          stub.stub.reset();
        });
      }
    }
    , remove: function(title){
      if (title){
        var stub = getter(stubs, title);
        restore(stub);
        _.pullAt(stubs, stubs.indexOf(stub));
      } else {
        stubs.forEach((stub)=>{
          restore(stub);
        });
        stubs = [];
      }
    }
  };

  return obj;
};
