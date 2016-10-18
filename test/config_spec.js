/* eslint-env node, mocha */

var chai = require('chai');
var expect = chai.expect;
var _      = require('lodash/core');
var sinon  = require('sinon');
var sinonChai = require("sinon-chai");
var rewire = require('rewire');
var Config = rewire('../src/config');
chai.use(sinonChai);

var mock = {
  assets_in: 'path/in'
  , assets_out: 'path/out'
};

describe('config', function(){
  describe('buildConfig', function(){
    var buildConfig, foo;
    beforeEach(function(){
      buildConfig = Config.__get__('buildConfig');
      foo = buildConfig(mock, 'foo');
    });

    it('should set input if none set', function(){
      expect(foo.input).to.contain('path/in/foo');
    });

    it('should set output if none set', function(){
      expect(foo.output).to.contain('path/out');
    });

    it('should not change input if one set', function(){
      var mock2     = _.clone(mock);
      mock2.foo = {input: 'path/to/foo'};
      foo       = buildConfig(mock2, 'foo');
      expect(foo.input).to.contain('path/to/foo');
    });

    it('should not change output if one set', function(){
      var mock2 = _.clone(mock);
      mock2.foo = {output:'path/to/foo'};
      foo = buildConfig(mock2, 'foo');
      expect(foo.output).to.contain('path/to/foo');
    });
  });

  describe('main_method', function(){
    var buildConfig, config, defaults, getConfig, reverts;
    before(function(){
      reverts = [];
      buildConfig = sinon.stub().returns({
        foo: 'bar'
        , input: 'some/input'
        , output: 'some/output'
      });

      getConfig = sinon.stub().returns({
        input: 'some/input'
        , output: 'some/output'
      });

      reverts.push(Config.__set__('getConfig', getConfig));
      reverts.push(Config.__set__('buildConfig', buildConfig));
    });

    beforeEach(()=>{
      config = Config({bar: 'foo'}, 'stuff');
    });

    afterEach(function(){
      getConfig.reset();
      buildConfig.reset();
    });

    after(function(){
      reverts.forEach((r)=>r());
    });

    it('should call getConfig', function() {
      expect(getConfig).to.have.been.calledOnce;
    });

    it('should call getConfig', function() {
      expect(buildConfig).to.have.been.calledOnce;
    });

    ['addInput', 'addOutput', 'get', 'set'].forEach((key)=>{
      it(`should return the correct ${key}`, function(){
        expect(_.has(config, key)).to.be.true;
        expect(_.isFunction(config[key])).to.be.true;
      });
    });

    it('should get data', function() {
      expect(config.get('foo')).to.equal('bar');
      expect(config.get('bar')).to.equal('foo');
    });

    it('should set data', function() {
      config.set('foo', 'bar2');
      expect(config.get('foo')).to.equal('bar2');
    });
  });
});
