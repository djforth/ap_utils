var expect = require('chai').expect;
var _      = require("lodash/core")
var sinon  = require('sinon');
var rewire = require('rewire');
var Config = rewire('../src/config');

var mock = {
    assets_in:"path/in"
  , assets_out: "path/out"
}

describe('config', function() {
  describe('buildConfig', function() {
    var buildConfig, foo
    beforeEach(function() {
      buildConfig = Config.__get__("buildConfig");
      foo = buildConfig(mock, "foo");
    });

    it('should set input if none set', function() {
      expect(foo.input).to.contain("path/in/foo")

    });

    it('should set output if none set', function() {
      expect(foo.output).to.contain("path/out")
    });

    it('should not change input if one set', function() {
      mock2     = _.clone(mock)
      mock2.foo = {input:"path/to/foo"}
      foo       = buildConfig(mock2, "foo");
      expect(foo.input).to.contain("path/to/foo");
    });

    it('should not change output if one set', function() {
      mock2 = _.clone(mock)
      mock2.foo = {output:"path/to/foo"}
      foo = buildConfig(mock2, "foo");
      expect(foo.output).to.contain("path/to/foo");
    });
  });

  describe('config helper', function() {
    var cf, defaults, mocker, revert, stub;
    before(function() {
      mocker = _.clone(mock);
      mocker.foo = {
        bar:"Phil Colins"
      }
      defaults = {
        bar:"test"
      , test:"foo"
      }
      stub = sinon.stub().returns({assets:mocker})
      revert = Config.__set__("get_package", stub);
      cf = Config(defaults, "foo");
    });

    after(function () {
      revert()
    });

    it('should set all the variables correctly', function() {

      expect(cf.get("input")).to.contain("path/in/foo");
      expect(cf.get("output")).to.contain("path/out");
      expect(cf.get("test")).to.equal("foo");
      expect(cf.get("bar")).to.equal("Phil Colins");
    });

    it('should allow to set config', function() {
      cf.set("bar", "test123");
      expect(cf.get("bar")).to.equal("test123");
    });

    it('should allow to set input', function() {
      cf.addInput("/foo/path/in");
      expect(cf.get("input")).to.contain("/foo/path/in");
    });

    it('should allow to set output', function() {
      cf.addOutput("/foo/path/out");
      expect(cf.get("output")).to.contain("/foo/path/out");
    });
  });

});