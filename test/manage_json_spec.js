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

describe('Manage JSON', function(){
  describe('parseJson', function(){
    var parseJson, buf, json;
    beforeEach(function(){
      json = {test: 'this is a test'};
      buf = Buffer.from(JSON.stringify(json), 'ascii');
      parseJson = ManageJSON.__get__('parseJson');
    });

    it('should return the correct array', function(){
      // [{key: 'test', value: 'this is a test'}]
      var json = parseJson(buf);
      expect(json).to.have.property('test', 'this is a test');
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

      it('should call error if no file', function(done){
        // let err = sinon.spy();
        let suc = sinon.spy();
        let err_json = ManageJSON(path.resolve('test', 'test22.json'));

        err_json.read(suc, (err)=>{
          expect(err).to.exist;
          expect(suc).not.to.have.been.called;
          done();
        });
      });

      it('should call success if  file', function(done){
        let err = sinon.spy();
        json_manager.read((data)=>{
          expect(data).to.equal('some json');
          expect(parse).to.have.been.called;
          expect(err).not.to.have.been.called;
          done();
        }, err);
      });
    });

    describe('Write', function(){
      let data;
      before(function(){
        data = {'test': 'this updated test'};
      });

      after(()=>{
        fs.writeFileSync(json_path, JSON.stringify({test: 'this is a test'}));
      });

      it('should call error if write error', function(done){
        // let err = sinon.spy();
        let suc = sinon.spy();
        let err_json = ManageJSON(path.resolve('test22', 'test.json'));

        err_json.write(data, suc, (err)=>{
          expect(err).to.exist;
          expect(suc).not.to.have.been.called;
          done();
        });
      });

      it('should call success if  file', function(done){
        let err = sinon.spy();

        json_manager.write(data, ()=>{
          expect(err).not.to.have.been.called;

          fs.readFile(json_path, function(err, data){
            data = JSON.parse(data.toString());
            expect(data).to.have.property('test', 'this updated test');
            done();
          });
        }, err);
      });
    });
  });
});
