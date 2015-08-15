import chai from 'chai';
import {createStore, combineReducers} from 'redux';
import {createAction, createReducer} from '../src/index.js';
const expect = chai.expect;

describe('createReducer', function () {
  let increment, decrement, add, sub, firstReducer, secondReducer;

  it('should init', function () {
    increment = createAction();
    decrement = createAction();
    add = createAction();
    sub = createAction();

    firstReducer = createReducer({
      [increment]: (state)=> state + 1,
      [add]: (state, action)=> state + action.payload
    }, 0);

    secondReducer = createReducer(function (on) {
      on(decrement, (state)=> state - 1);
      on(sub, (state, action)=> state - action.payload);
    }, 42);
  });

  it('should be a valid first reducer', function () {
    expect(firstReducer).to.be.a('function');
  });

  it('should be a valid second reducer', function () {
    expect(secondReducer).to.be.a('function');
  });

  it('should update a store', function () {
    const store = createStore(firstReducer, 0);
    store.dispatch(increment());
    expect(store.getState()).to.equal(1);
    store.dispatch(increment());
    expect(store.getState()).to.equal(2);
    store.dispatch(add(40));
    expect(store.getState()).to.equal(42);
  });

  it('should update a store bis', function () {
    const store = createStore(secondReducer, 42);
    store.dispatch(decrement());
    expect(store.getState()).to.equal(41);
    store.dispatch(decrement());
    expect(store.getState()).to.equal(40);
    store.dispatch(sub(40));
    expect(store.getState()).to.equal(0);
  });

  it('should combine reducers', function () {
    const ultimateReducer = combineReducers({
      up: firstReducer,
      down: secondReducer
    });

    const store = createStore(ultimateReducer);

    store.dispatch(increment());
    expect(store.getState()).to.deep.equal({up: 1, down: 42});
    store.dispatch(increment());
    expect(store.getState()).to.deep.equal({up: 2, down: 42});
    store.dispatch(decrement());
    expect(store.getState()).to.deep.equal({up: 2, down: 41});
    store.dispatch(sub(30));
    expect(store.getState()).to.deep.equal({up: 2, down: 11});
    store.dispatch(add(40));
    expect(store.getState()).to.deep.equal({up: 42, down: 11});
    store.dispatch(decrement());
    expect(store.getState()).to.deep.equal({up: 42, down: 10});
    store.dispatch(sub(10));
    expect(store.getState()).to.deep.equal({up: 42, down: 0});
  });
});
