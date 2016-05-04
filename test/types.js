import chai from 'chai';
import { types } from '../src/index.js';
const expect = chai.expect;

describe('types', function () {
  before(function () {
    types.clear();
  });

  it('should add types', function () {
    expect(types.has('one')).to.be.false;
    expect(types.has('two')).to.be.false;
    types.add('one');
    expect(types.has('one')).to.be.true;
    expect(types.has('two')).to.be.false;
    types.add('two');
    expect(types.has('one')).to.be.true;
    expect(types.has('two')).to.be.true;
  });

  it('should remove types', function () {
    expect(types.has('one')).to.be.true;
    expect(types.has('two')).to.be.true;
    types.remove('one');
    expect(types.has('one')).to.be.false;
    expect(types.has('two')).to.be.true;
    types.remove('two');
    expect(types.has('one')).to.be.false;
    expect(types.has('two')).to.be.false;
  });

  it('should test if it has a type', function () {
    expect(types.has('one')).to.be.false;
    expect(types.has('two')).to.be.false;
    expect(types.has('three')).to.be.false;
    types.add('one');
    expect(types.has('one')).to.be.true;
    expect(types.has('two')).to.be.false;
    expect(types.has('three')).to.be.false;
    types.add('two');
    expect(types.has('one')).to.be.true;
    expect(types.has('two')).to.be.true;
    expect(types.has('three')).to.be.false;
    types.remove('one');
    expect(types.has('one')).to.be.false;
    expect(types.has('two')).to.be.true;
    expect(types.has('three')).to.be.false;
  });

  it('should return all types', function () {
    types.clear();
    expect(types.all()).to.deep.equal([]);
    types.add('one');
    expect(types.all()).to.deep.equal(['one']);
    types.add('two');
    expect(types.all()).to.deep.equal(['one', 'two']);
    types.add('three');
    expect(types.all()).to.deep.equal(['one', 'two', 'three']);
    types.remove('two');
    expect(types.all()).to.deep.equal(['one', 'three']);
    types.clear();
    expect(types.all()).to.deep.equal([]);
  });

  it('should clear', function () {
    types.add('one');
    types.add('two');
    types.add('three');
    expect(types.has('one')).to.be.true;
    expect(types.has('two')).to.be.true;
    expect(types.has('three')).to.be.true;

    types.clear();
    expect(types.has('one')).to.be.false;
    expect(types.has('two')).to.be.false;
    expect(types.has('three')).to.be.false;
    expect(types.all()).to.deep.equal([]);
  });
});
