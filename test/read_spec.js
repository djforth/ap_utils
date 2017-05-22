/* eslint-env node, mocha */
var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash/core');
var rewire = require('rewire');
var Read = rewire('../src/read');
var path = require('path');
var es = require('event-stream');

describe('should read folder', function() {
  it('should read folder file that match *.txt', function(done) {
    Read(path.resolve('./test/test_folder'), '*.txt')
      .pipe(es.mapSync(function(file){
        done();
        expect(file.name).to.equal('test.txt')
      }));
  });

  it('should read folder file that match *.jpg', function(done) {
    Read(path.resolve('./test/test_folder'), '*.jpg')
      .pipe(es.mapSync(function(file){
        done();
        expect(file.name).to.equal('brian_blessed.jpg');
      }));
  });
});