/* eslint-env node, mocha */
var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash/core');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");
var rewire = require('rewire');
var GetConfig = rewire('../src/get_config');
chai.use(sinonChai);

describe('get_config', function(){
  describe('fileExists', function(){
    let fileExists;
    before(function(){
      fileExists = GetConfig.__get__('fileExists');
    });

    it('should return false if not valid', function(){
      expect(fileExists('./foo')).to.be.false;
    });

    it('should return true data if file exists', function(){
      expect(fileExists('./.apconfig')).to.be.true;
    });
  });

  describe('getAPConfig', function(){
    let getAPConfig;
    before(function(){
      getAPConfig = GetConfig.__get__('getAPConfig');
    });

    it('should return correct data', function(){
      var data = getAPConfig();
      expect(data).to.not.be.undefined;
      expect(data.test).to.equal('this is for testing');
    });
  });

  describe('getPackageConfig', function() {
    let getPackageConfig;
    before(function(){
      getPackageConfig = GetConfig.__get__('getPackageConfig');
    });

    it('should return correct data', function(){
      var data = getPackageConfig();
      expect(data).to.not.be.undefined;
      expect(data.test).to.equal('this is a package test');
    });
  });

  describe('main method', function() {
    let reverts, pck, config, exists, data;
    before(function(){
      reverts = [];
      pck = sinon.stub().returns('some package config');
      config = sinon.stub().returns('some apconfig data');
      exists = sinon.stub();
      exists.onCall(0).returns(true);
      exists.onCall(1).returns(false);
      reverts.push(GetConfig.__set__('getPackageConfig', pck));
      reverts.push(GetConfig.__set__('getAPConfig', config));
      reverts.push(GetConfig.__set__('fileExists', exists));
    });

    beforeEach(()=>{
      data = GetConfig();
    });

    afterEach(function(){
      config.reset();
      pck.reset();
    });

    it('should use .apconfig if it exists ', function(){
      expect(data).to.equal('some apconfig data');
      // console.log(config)
      expect(exists).to.have.been.calledWith('./.apconfig');
      expect(config).to.have.been.calledOnce;
      expect(pck).not.to.have.been.called;
    });

    it('should if .apconfig doesn\'t exists ', function(){
      expect(data).to.equal('some package config');
      // console.log(config)
      expect(exists).to.have.been.calledWith('./.apconfig');
      expect(config).not.to.have.been.called;
      expect(pck).to.have.been.called;
    });

    after(function(){
      reverts.forEach((r)=>r());
    });
  });
});

