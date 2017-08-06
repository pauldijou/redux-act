import chai from 'chai';
import spies from 'chai-spies-next';
import { createStore, combineReducers } from 'redux';
import {batch, createAction, createReducer} from '../src/index.js';
const expect = chai.expect;
chai.use(spies);

describe('batch', function () {
  function init() {
    const inc = createAction();
    const dec = createAction();
    const reducer = createReducer({
      [inc]: (state) => state + 1,
      [dec]: (state) => state - 1
    }, 0);
    const store = createStore(reducer);
    const spy = chai.spy();
    store.subscribe(spy);
    return { inc, dec, reducer, store, spy };
  }

  it('should work with actions', function () {
    const { inc, dec, reducer, store, spy } = init();
    expect(store.getState()).to.equal(0);
    expect(spy).to.have.been.called.exactly(0);
    store.dispatch(inc());
    store.dispatch(inc());
    expect(store.getState()).to.equal(2);
    expect(spy).to.have.been.called.exactly(2);
    store.dispatch(batch(inc(), dec(), dec()));
    expect(store.getState()).to.equal(1);
    expect(spy).to.have.been.called.exactly(3);
  });

  it('should work with an array of actions', function () {
    const { inc, dec, reducer, store, spy } = init();
    expect(store.getState()).to.equal(0);
    expect(spy).to.have.been.called.exactly(0);
    store.dispatch(inc());
    store.dispatch(inc());
    expect(store.getState()).to.equal(2);
    expect(spy).to.have.been.called.exactly(2);
    store.dispatch(batch([inc(), dec(), dec()]));
    expect(store.getState()).to.equal(1);
    expect(spy).to.have.been.called.exactly(3);
  });

  it('should work with combined reducers', function () {
    const inc = createAction();
    const dec = createAction();
    const append = createAction();
    const reset = createAction();
    const counter = createReducer({
      [inc]: (state) => state + 1,
      [dec]: (state) => state - 1,
    }, 0);
    const text = createReducer({
      [append]: (state, action) => state + action.payload,
      [reset]: () => '',
    }, '');
    text.options({
      payload: false
    });

    const store = createStore(combineReducers({ counter, text }));
    const spy = chai.spy();
    store.subscribe(spy);

    expect(store.getState()).to.deep.equal({ counter: 0, text: '' });
    expect(spy).to.have.been.called.exactly(0);
    store.dispatch(batch(inc(), inc(), dec(), append('a'), append('b')));
    expect(store.getState()).to.deep.equal({ counter: 1, text: 'ab' });
    expect(spy).to.have.been.called.exactly(1);
    store.dispatch(batch([reset(), inc(), append('zyx'), dec(), dec(), append('321')]));
    expect(store.getState()).to.deep.equal({ counter: 0, text: 'zyx321' });
    expect(spy).to.have.been.called.exactly(2);
  });

  it('should be disableable on a reducer', function () {
    const { inc, dec, reducer, store, spy } = init();
    reducer.off(batch);
    expect(store.getState()).to.equal(0);
    expect(spy).to.have.been.called.exactly(0);
    store.dispatch(batch(inc(), inc()));
    expect(store.getState()).to.equal(0);
    expect(spy).to.have.been.called.exactly(1);

    // We can re-enable it of course
    reducer.on(batch, (state, payload) => payload.reduce(reducer, state));
    store.dispatch(batch(inc(), inc()));
    expect(store.getState()).to.equal(2);
    expect(spy).to.have.been.called.exactly(2);
  });

  it('should be assignable', function () {
    const { inc, dec, reducer, store, spy } = init();
    batch.assignTo(store);
    expect(store.getState()).to.equal(0);
    expect(spy).to.have.been.called.exactly(0);
    batch(inc(), inc(), dec());
    expect(store.getState()).to.equal(1);
    expect(spy).to.have.been.called.exactly(1);
  });

  it('should be bindable', function () {
    const { inc, dec, reducer, store, spy } = init();
    const boundBatch = batch.bindTo(store);
    expect(store.getState()).to.equal(0);
    expect(spy).to.have.been.called.exactly(0);
    boundBatch(inc(), inc(), dec());
    expect(store.getState()).to.equal(1);
    expect(spy).to.have.been.called.exactly(1);
  });

  it('should support empty payload', function () {
    const { inc, dec, reducer, store, spy } = init();
    expect(store.getState()).to.equal(0);
    expect(spy).to.have.been.called.exactly(0);
    store.dispatch(batch());
    expect(store.getState()).to.equal(0);
    expect(spy).to.have.been.called.exactly(1);
  });
});
