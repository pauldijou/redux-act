import chai from 'chai';
import {createStore, combineReducers} from 'redux';
import {createAction, createReducer} from '../src/index';
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
      [add]: (state, payload)=> state + payload
    }, 0);

    secondReducer = createReducer(function (on) {
      on(decrement, (state)=> state - 1);
      on(sub, (state, payload)=> state - payload);
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

  it('should have dynamic actions', function () {
    const handlers = {};
    const reducer = createReducer(handlers, 0);
    const store = createStore(reducer);
    const inc = createAction().bindTo(store);
    handlers[inc] = (state)=> state + 1;

    inc();
    expect(store.getState()).to.equal(1);
    inc();
    expect(store.getState()).to.equal(2);
    inc();
    expect(store.getState()).to.equal(3);

    delete handlers[inc];

    inc();
    expect(store.getState()).to.equal(3);
    inc();
    expect(store.getState()).to.equal(3);
  });

  it('should support on and off methods', function () {
    const reducer = createReducer({}, 0);
    const store = createStore(reducer);
    const inc = createAction().bindTo(store)

    reducer.on(inc, state=> state + 1)

    inc();
    expect(store.getState()).to.equal(1);
    inc();
    expect(store.getState()).to.equal(2);
    inc();
    expect(store.getState()).to.equal(3);

    reducer.off(inc);

    inc();
    expect(store.getState()).to.equal(3);
    inc();
    expect(store.getState()).to.equal(3);
  });

  it('should update its options', function () {
    const add = createAction();
    const reducer = createReducer({
      [add]: (state, action)=> state + action.payload
    }, 0);
    reducer.options({payload: false});
    const store = createStore(reducer);
    add.bindTo(store);

    add(3);
    expect(store.getState()).to.equal(3);
    add(2);
    expect(store.getState()).to.equal(5);

    reducer.on(add, (state, payload)=> state + payload);
    reducer.options({payload: true});

    add(-4);
    expect(store.getState()).to.equal(1);
    add(10);
    expect(store.getState()).to.equal(11);

    reducer.on(add, (state, action)=> state + action.payload);
    reducer.options({payload: false});

    add(30);
    expect(store.getState()).to.equal(41);
    add(1);
    expect(store.getState()).to.equal(42);
  });

  it('should support meta', function () {
    const add = createAction(undefined, undefined, arg=> arg * 2);
    const reducer = createReducer({
      [add]: (state, payload, meta)=> state + payload * meta
    }, 0);
    const store = createStore(reducer);
    add.bindTo(store);
    add(3);
    expect(store.getState()).to.equal(18);
  });

});
