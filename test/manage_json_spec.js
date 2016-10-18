/* eslint-env node, mocha */

var chai = require('chai');
var expect = chai.expect;
var _      = require('lodash');
var sinon  = require('sinon');
var sinonChai = require('sinon-chai');
var rewire = require('rewire');
var path = require('path');
var mkdirp   = require('mkdirp');
var ManageJSON = rewire('../src/manage_json');
var fs = require('fs');
chai.use(sinonChai);

var Stubs = require('./utils/stub_function');
var stubs = Stubs(ManageJSON);

describe('Manage JSON', function() {
  describe('prepJson', function(){
    var prepJson;
    beforeEach(function(){
      prepJson = ManageJSON.__get__('prepJson');
    });

    it('should return the correct array', function() {
      var json = prepJson([{key: 'test', value: 'this is a test'}]);
      expect(_.isPlainObject(json)).to.be.true;
      expect(_.has(json, 'test')).to.be.true;
      expect(json.test).to.equal('this is a test');
    });
  });

  describe('parseJson', function(){
    var parseJson;
    beforeEach(function(){
      parseJson = ManageJSON.__get__('parseJson');
    });

    it('should return the correct array', function(){
      // [{key: 'test', value: 'this is a test'}]
      var json = parseJson(JSON.stringify({test: 'this is a test'}));
      expect(_.isArray(json)).to.be.true;
      var jsn = json[0];
      expect(jsn.key).to.equal('test');
      expect(jsn.value).to.equal('this is a test');
    });
  });

  describe('main method', function(){
    let json_path, json_manager;
    before(function(){
      json_path = path.resolve('test', 'test.json');
      json_manager = ManageJSON(json_path);
    });

    ['read', 'write'].forEach((key)=>{
      it(`should have the key - ${key}`, function(){
        expect(_.has(json_manager, key)).to.be.true;
        expect(_.isFunction(json_manager[key])).to.be.true;
      });
    });

    describe('reading json', function(){
      let parse, revert;
      before(function(){
        parse =  sinon.stub().returns('some json');
        revert = ManageJSON.__set__('parseJson', parse);
      });

      after(()=>{
        revert();
      });

      it('should call error if no file', function(done) {
        // let err = sinon.spy();
        let suc = sinon.spy();
        let err_json = ManageJSON(path.resolve('test', 'test22.json'));

        err_json.read(suc, (err)=>{
          expect(err).to.exist;
          expect(suc).not.to.have.been.called;
          done();
        });
      });

      it('should call success if  file', function(done) {
        let err = sinon.spy();

        json_manager.read((data)=>{
          expect(data).to.equal('some json');
          expect(parse).to.have.been.called;
          expect(err).not.to.have.been.called;
          done();
        }, err);
      });
    });

    describe('Write', function() {
      let data, prep, revert;
      before(function(){
        data = [{key: 'test', value: 'this updated test'}];
        prep =  sinon.stub().returns({test: 'this updated test'});
        revert = ManageJSON.__set__('prepJson', prep);
      });

      after(()=>{
        revert();
        fs.writeFileSync(json_path, JSON.stringify({test: 'this is a test'}));
      });

      it('should call error if write error', function(done) {
        // let err = sinon.spy();
        let suc = sinon.spy();
        let err_json = ManageJSON(path.resolve('test22', 'test.json'));

        err_json.write(data, suc, (err)=>{
          expect(err).to.exist;
          expect(prep).to.have.been.calledWith(data);
          expect(suc).not.to.have.been.called;
          done();
        });
      });

      it('should call success if  file', function(done) {
        let err = sinon.spy();

        json_manager.write(data, ()=>{
          expect(prep).to.have.been.calledWith(data);
          expect(err).not.to.have.been.called;

          fs.readFile(json_path, function(err, data){
            data = JSON.parse(data.toString());
            console.log(data.test);
            expect(data).to.have.property('test', "this updated test");
            done();
          });
        }, err);
      });
    });
  });
});
