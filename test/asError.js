import chai from 'chai';
import {createStore} from 'redux';
import {asError, createAction} from '../src/index.js';
const expect = chai.expect;

describe('asError', function () {
  it('should set error', function () {
    const goodAction = createAction()();
    expect(goodAction.error).to.be.false;

    const badAction = asError(goodAction);
    expect(badAction.error).to.be.true;
  });

  it('should do nothing on non-action', function () {
    const nullAction = null;
    const undefinedAction = null;
    expect(asError(nullAction)).to.equal(nullAction);
    expect(asError(undefinedAction)).to.equal(undefinedAction);
  });
});
