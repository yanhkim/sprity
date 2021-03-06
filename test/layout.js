'use strict';

var should = require('chai').should();
var layout = require('../lib/layout');
var spy = require('through2-spy').obj;
var os = require('object-stream');
var noop = function () {};

require('mocha');

var opts = {};

beforeEach(function () {
  opts = {
    margin: 4,
    orientation: 'vertical',
    split: false,
    sort: true
  };
});

describe('sprity layout (lib/layout.js)', function () {

  it('should return a stream with one layout object', function (done) {
    var count = 0;
    opts.prefix = 'test';
    os.fromArray([{
        base: '/mock/fixtures/',
        height: 100,
        width: 100
      }, {
        base: '/mock/fixtures2/',
        height: 100,
        width: 100
      }])
      .pipe(layout(opts))
      .pipe(spy(function (res) {
        var l = res.layout;
        l.items.length.should.equal(2);
        l.should.have.property('width', 108);
        l.should.have.property('height', 216);
        count++;
      }))
      .on('data', noop)
      .on('finish', function () {
        count.should.equal(1);
        done();
      });
  });

  it('should return a stream with two layout objects, when folder splitting is activted', function (done) {
    var count = 0;
    opts.split = true;
    opts.orientation = 'left-right';
    require('object-stream').fromArray([{
        base: '/mock/fixtures/',
        height: 100,
        width: 100
      }, {
        base: '/mock/fixtures2/',
        height: 100,
        width: 100
      }])
      .pipe(layout(opts))
      .pipe(spy(function (res) {
        count++;
      }))
      .on('data', noop)
      .on('finish', function () {
        count.should.equal(2);
        done();
      });
  });

  it('should throw an error when no layouts where created', function (done) {
    os.fromArray([{wrongtile: true}, {wrongtile: true}])
      .pipe(layout(opts))
      .on('error', function (e) {
        e.should.have.property('name', 'LayoutError');
        done();
      });
  });

  it('should bypass image that exceed its size limit', function (done) {
    var count = 0;
    var bypassed = 0;
    opts['bypass-size'] = 100;
    require('object-stream').fromArray([{
        base: '/mock/fixtures/',
        height: 100,
        width: 100
      }, {
        base: '/mock/fixtures2/',
        height: 200,
        width: 200
      }])
      .pipe(layout(opts))
      .pipe(spy(function (res) {
        if (res.bypassed) {
          bypassed++;
          return;
        }
        var l = res.layout;
        l.items.length.should.equal(1);
        l.should.have.property('width', 108);
        l.should.have.property('height', 108);
        count++;
      }))
      .on('data', noop)
      .on('finish', function () {
        count.should.equal(1);
        bypassed.should.equal(1);
        done();
      });
  });

  it('should return a stream with three layout objects, when size splitting is activated', function (done) {
    var count = 0;
    opts['split-max-size'] = 150;
    require('object-stream').fromArray([{
        base: '/mock/fixtures/',
        height: 100,
        width: 100
      }, {
        base: '/mock/fixtures2/',
        height: 100,
        width: 100
      }, {
        base: '/mock/fixtures3/',
        height: 100,
        width: 100
      }])
      .pipe(layout(opts))
      .pipe(spy(function (res) {
        count++;
      }))
      .on('data', noop)
      .on('finish', function () {
        count.should.equal(3);
        done();
      });
  });

  it('should set image size to nearest power of 2 when option turned on', function (done) {
    var count = 0;
    opts['power-of-2-size'] = true;
    require('object-stream').fromArray([{
        base: '/mock/fixtures/',
        height: 100,
        width: 100
      }, {
        base: '/mock/fixtures2/',
        height: 100,
        width: 100
      }])
      .pipe(layout(opts))
      .pipe(spy(function (res) {
        var l = res.layout;
        l.items.length.should.equal(2);
        l.should.have.property('width', 128);
        l.should.have.property('height', 256);
        count++;
      }))
      .on('data', noop)
      .on('finish', function () {
        count.should.equal(1);
        done();
      });
  });

});
