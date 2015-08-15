import chai from 'chai';
import {createStore} from 'redux';
import {createAction, createReducer} from '../src/index.js';
const expect = chai.expect;

describe('createAction', function () {
  let firstAction, secondAction, reducer;

  it('should create one action creator', function () {
    firstAction = createAction();
    expect(firstAction).to.be.a('function');
    expect(firstAction.toString).to.be.a('function');
    expect(firstAction.bindTo).to.be.a('function');
  });

  it('should return a valid action', function () {
    const action = firstAction(42);
    expect(action).to.be.an('object');
    expect(action).to.have.all.keys('id', 'type', 'payload');
    expect(action.id).to.be.a('number');
    expect(action.type).to.be.a('string');
    expect(action).to.have.property('payload', 42);
  });

  it('should return a valid action again', function () {
    const action = firstAction('a string');
    expect(action).to.be.an('object');
    expect(action).to.have.all.keys('id', 'type', 'payload');
    expect(action.id).to.be.a('number');
    expect(action.type).to.be.a('string');
    expect(action).to.have.property('payload', 'a string');
  });

  it('should create a second action creator', function () {
    secondAction = createAction('second action', (one, two, three)=> ({one, two, three: three.join(', ')}));
    expect(secondAction).to.be.a('function');
    expect(secondAction.toString).to.be.a('function');
    expect(secondAction.bindTo).to.be.a('function');
  });

  it('should return a valid second action', function () {
    const action = secondAction(111, 'test', [1, 'a', true]);
    expect(action).to.be.an('object');
    expect(action).to.have.all.keys('id', 'type', 'payload');
    expect(action.id).to.be.a('number');
    expect(action.type).to.be.a('string');
    expect(action.type).to.have.string('second action');
    expect(action.payload).to.deep.equal({one: 111, two: 'test', three: '1, a, true'});
  });

  it('should return a valid second action again', function () {
    const action = secondAction(true, 222, ['a', 'b', 'c', 'd']);
    expect(action).to.be.an('object');
    expect(action).to.have.all.keys('id', 'type', 'payload');
    expect(action.id).to.be.a('number');
    expect(action.type).to.be.a('string');
    expect(action.type).to.have.string('second action');
    expect(action.payload).to.deep.equal({one: true, two: 222, three: 'a, b, c, d'});
  });

  it('should dispatch actions', function () {
    reducer = createReducer({
      [firstAction]: (state, action)=> {
        state.first += action.payload;
        return state;
      },
      [secondAction]: (state, action)=> {
        state.second += '' + action.payload.one + action.payload.two + action.payload.three + ' - ';
        return state;
      }
    });

    const store = createStore(reducer, {first: 0, second: ''});

    store.dispatch(firstAction(1));
    expect(store.getState()).to.deep.equal({first: 1, second: ''});

    store.dispatch(secondAction(1, '2', [3, '4']));
    expect(store.getState()).to.deep.equal({first: 1, second: '123, 4 - '});

    store.dispatch(firstAction(20));
    store.dispatch(firstAction(21));
    expect(store.getState()).to.deep.equal({first: 42, second: '123, 4 - '});

    store.dispatch(secondAction(true, 0, ['a', false]));
    expect(store.getState()).to.deep.equal({first: 42, second: '123, 4 - true0a, false - '});
  });

  it('should bind to a store', function () {
    const store = createStore(reducer, {first: 0, second: ''});
    firstAction.bindTo(store);
    secondAction.bindTo(store);

    firstAction(1);
    expect(store.getState()).to.deep.equal({first: 1, second: ''});

    secondAction(1, '2', [3, '4']);
    expect(store.getState()).to.deep.equal({first: 1, second: '123, 4 - '});

    firstAction(20);
    firstAction(21);
    expect(store.getState()).to.deep.equal({first: 42, second: '123, 4 - '});

    secondAction(true, 0, ['a', false]);
    expect(store.getState()).to.deep.equal({first: 42, second: '123, 4 - true0a, false - '});
  });

  it('should chain correctly using bindTo', function () {
    const actions = {};
    const reducer = createReducer(actions, 0);
    const store = createStore(reducer);
    const action = createAction().bindTo(store);
    actions[action] = (state)=> state + 1;
    action();
    expect(store.getState()).to.equal(1);
    action();
    expect(store.getState()).to.equal(2);
    action();
    expect(store.getState()).to.equal(3);
  });
});
