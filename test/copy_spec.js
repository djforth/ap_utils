/* eslint-env node, mocha */

var chai = require('chai');
var expect = chai.expect;
var _      = require('lodash/core');
var sinon  = require('sinon');
var sinonChai = require('sinon-chai');
var rewire = require('rewire');
var path = require('path');
var Copy = rewire('../src/copy');
var readdirp = require('readdirp');
var path = require('path');
var fs = require('fs');
// var mkdirp   = require('mkdirp');
chai.use(sinonChai);

var Stubs = require('./utils/stub_function');
var stubs = Stubs(Copy);

var Spies = require('./utils/spy_manager');
var spies = Spies(Copy);

function fileExists(file){
  try {
    fs.accessSync(path.resolve(file), fs.F_OK);
    return true;
  } catch (e){
    // console.log(e)
    return false;
  }
}

function readFolder(){
  return readdirp({root: path.resolve('test', './test2_folder'), fileFilter:'*.txt'});
}

// function copyFile(to, from){
//   fs.createReadStream(to).pipe(fs.createWriteStream(from));
// }

describe('Copy', function(){
  describe('createDone', function(){
    var createDone, callback, spy;
    before(function(){
      createDone = Copy.__get__('createDone');
      spy = sinon.spy();
      callback = createDone(spy);
    });

    it('should return function', function(){
      expect(_.isFunction(callback)).to.be.true;
    });

    it('should only call spy once', function(){
      callback('foo');
      callback('bar');
      expect(spy).to.have.been.calledOnce;
      expect(spy).to.have.been.calledWith('foo');
    });
  });

  describe('pathManager', function(){
    var pathManager, path_manager;
    before(function(){
      pathManager = Copy.__get__('pathManager');
      path_manager = pathManager('./test');
    });

    it('should return function', function(){
      expect(_.isFunction(path_manager)).to.be.true;
    });

    it('should return correct path', function(){
      expect(path_manager('test_folder')).to.equal(path.resolve('test', 'test_folder'));
    });
  });

  describe('copy file', function(){
    var copyFile, cb, createDone, revert;
    var file = path.resolve('test', 'copy_folder', 'test.txt');
    before(function(){
      cb = sinon.spy();
      spies.add(['createDone']);

      createDone = sinon.stub().returns(cb);
      revert = Copy.__set__('createDone', createDone);
      copyFile = Copy.file();
    });

    after(()=>{
      if (fileExists(file)){
        fs.unlinkSync(file);
      }

      revert();
    });

    ['from', 'to', 'copy'].forEach((key)=>{
      it(`should have the key - ${key}`, function(){
        expect(_.has(copyFile, key)).to.be.true;
        expect(_.isFunction(copyFile[key])).to.be.true;
      });
    });

    it('should not copy file if no to or from set', function(){
      copyFile.copy(cb);
      expect(fileExists(file)).to.be.false;
      expect(createDone).to.have.been.called;
      expect(cb).not.to.have.been.called;
    });

    it('should copy file if to & from set', function(){
      copyFile
        .from(path.resolve('test', './test_folder', 'test.txt'))
        .to(path.resolve('test', './copy_folder', 'test.txt'))
        .copy(cb);
      expect(fileExists(file)).to.be.true;
      expect(createDone).to.have.been.called;
      expect(cb).to.have.been.called;
    });
  });

  describe('should copy whole folder', function(){
    var copyFolder, cb;
    var files = [
      path.resolve('test', 'copy_folder', 'inner', 'test2.txt')
    ];
    before(function(){

      cb = sinon.spy();
      stubs.add([
        ['read', readFolder()]
        , ['pathManager', (folder)=>path.resolve('test', 'copy_folder', folder)]
        // , {title: 'create', opts: ['folder', createFolder]}
      ]);
      copyFolder = Copy.folder();
    });

    afterEach(()=>{

      stubs.reset();
    });

    after(()=>{
      stubs.remove();

      files.forEach((file)=>{
        if (fileExists(file)){
          // console.log('after',file, fileExists(file))
          fs.unlinkSync(file);
        }
      });
      let folder = path.resolve('test', 'copy_folder', 'inner');
      if (fileExists(folder)){
        fs.rmdirSync(folder);
      }
    });

    ['from', 'to', 'copy'].forEach((key)=>{
      it(`should have the key - ${key}`, function(){
        expect(_.has(copyFolder, key)).to.be.true;
        expect(_.isFunction(copyFolder[key])).to.be.true;
      });
    });

    it('should call read on from', function(){
      var folder = path.resolve('test', 'test_folder');
      copyFolder.from(folder, '*.txt');
      expect(stubs.get('read')).to.have.been.calledWith(folder, '*.txt');
    });

    it('should call create.folder & pathManager', function(){
      copyFolder.to(path.resolve('test', 'copy_folder'));
      // expect(stubs.get('create', 'folder')).to.have.been.calledWith('foo');
      expect(stubs.get('pathManager')).to.have.been.calledWith(path.resolve('test', 'copy_folder'));
    });

    it('copy', function(done) {
      var fromFolder = path.resolve('test', 'test2_folder');
      var toFolder = path.resolve('test', 'copy_folder');
      this.timeout(5000);
      copyFolder.from(fromFolder)
                .to(toFolder)
                .copy(()=>{
                  cb();
                  files.forEach((file)=>{
                    expect(fileExists(file)).to.be.true;
                  });
                  done();
                });
    });
  });
});
