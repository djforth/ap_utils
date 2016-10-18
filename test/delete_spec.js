/* eslint-env node, mocha */

var chai = require('chai');
var expect = chai.expect;
var _      = require('lodash/core');
var sinon  = require('sinon');
var sinonChai = require('sinon-chai');
var rewire = require('rewire');
var path = require('path');
var mkdirp   = require('mkdirp');
var Delete = rewire('../src/delete');
var fs = require('fs');
chai.use(sinonChai);

var Stubs = require('./utils/stub_function');
var stubs = Stubs(Delete);

var files = ['test.txt', 'brian_blessed.jpg'];

files = files.map((file)=>{
  var read = path.resolve('test', 'test_folder', file);
  var write = path.resolve('test', 'copy_folder', file);
  return {read, write};
});

function fileExists(file){
  try {
    fs.accessSync(path.resolve(file), fs.F_OK);
    return true;
  } catch (e){
    return false;
  }
}

function copyFiles(){
  files.forEach((file)=>{
    fs.createReadStream(file.read).pipe(fs.createWriteStream(file.write));
  });
}

describe('delete', function(){
  beforeEach(function(){
    copyFiles();
  });

  afterEach(function(done){
    files.forEach((file)=>{
      if (fileExists(file.write)){
        fs.unlinkSync(file.write);
      }
    });
    let folder = path.resolve('test', 'copy_folder');
    if (fileExists(folder)) done();
    else {
      mkdirp(folder, function(err){
        if (err) console.error(err);
        else if (_.isFunction(done)) done(err);
      });
    }
  });

  describe('delete file', function(){
    it('should remove file', function(done){
      let file = files[0].write;
      Delete.file(file, ()=>{
        expect(fileExists(file)).to.be.false;
        done();
      });
    });
  });

  describe('delete folder', function(){
    var folder, folder_path;
    before(()=>{
      folder_path = path.resolve('test', 'copy_folder');
      folder = Delete.folder(folder_path)
    });

    it('should returns a function', function() {
      expect(_.isFunction(folder)).to.be.true;
    });

    it('should delete all files in folder', function(done){
      files.forEach((file)=>{
        expect(fileExists(file.write)).to.be.true;
      });

      folder(()=>{
        files.forEach((file)=>{
          expect(fileExists(file.write)).to.be.false;
        });

        expect(fileExists(folder_path)).to.be.true;
        done();
      });
    });

    it('should delete all files in folder + remove folder', function(done){
      files.forEach((file)=>{
        expect(fileExists(file.write)).to.be.true;
      });

      folder(()=>{
        files.forEach((file)=>{
          expect(fileExists(file.write)).to.be.false;
        });
        expect(fileExists(folder_path)).to.be.false;
        done();
      }, true);
    });
  });
});
