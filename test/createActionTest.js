import chai from 'chai';
import {createStore} from 'redux';
import {createAction, createReducer} from '../src/index';
import { ID } from '../src/constants';
const expect = chai.expect;

describe('createAction', function () {
  let firstAction, secondAction, reducer;

  function testActionCreator(actionCreator) {
    expect(actionCreator).to.be.a('function');
    expect(actionCreator.toString).to.be.a('function');
    expect(actionCreator.bindTo).to.be.a('function');
  }

  function testAction(action, payload, description, meta) {
    expect(action).to.be.an('object');
    expect(action).to.contain.keys(ID, 'type', 'payload');
    expect(action[ID]).to.be.a('number');
    expect(action.type).to.be.a('string');
    expect(action.payload).to.deep.equal(payload);
    if (typeof description !== 'undefined') {
      expect(action.type).to.have.string(description);
    }
    if (typeof meta !== 'undefined') {
      expect(action.meta).to.deep.equal(meta);
    }
  }

  it('should support all format', function () {
    const simple = createAction();
    const description = createAction('awesome description');
    const args = createAction((num, text)=> ({one: num, text}));
    const both = createAction('description', (id, content)=> ({id, content}));
    const argsWithMeta = createAction((num, text)=> ({one: num, text}), (num, text) => ({more: num + 1, append: text + ' world'}));
    const bothWithMeta = createAction('description meta', (id, content)=> ({id, content}), (id, content) => ({more: true, prepend: 'hello ' + content}));

    testActionCreator(simple);
    testActionCreator(description);
    testActionCreator(args);
    testActionCreator(both);
    testActionCreator(argsWithMeta);
    testActionCreator(bothWithMeta);

    const simpleAction = simple(1);
    const descriptionAction = description(true);
    const argsAction = args(4, 'hello');
    const bothAction = both(2, 'world');
    const argsWithMetaAction = argsWithMeta(4, 'hello');
    const bothWithMetaAction = bothWithMeta(2, 'world');

    testAction(simpleAction, 1);
    testAction(descriptionAction, true, 'awesome description');
    testAction(argsAction, {one: 4, text: 'hello'});
    testAction(bothAction, {id: 2, content: 'world'}, 'description');
    testAction(argsWithMetaAction, {one: 4, text: 'hello'}, undefined, {more: 5, append: 'hello world'});
    testAction(bothWithMetaAction, {id: 2, content: 'world'}, 'description meta', {more: true, prepend: 'hello world'});
  });

  it('should create one action creator', function () {
    firstAction = createAction();
    testActionCreator(firstAction);
  });

  it('should return a valid action', function () {
    const action = firstAction(42);
    testAction(action, 42);
  });

  it('should return a valid action again', function () {
    const action = firstAction('a string');
    testAction(action, 'a string');
  });

  it('should create a second action creator', function () {
    secondAction = createAction('second action', (one, two, three)=> ({one, two, three: three.join(', ')}));
    testActionCreator(secondAction);
  });

  it('should return a valid second action', function () {
    const action = secondAction(111, 'test', [1, 'a', true]);
    testAction(action, {one: 111, two: 'test', three: '1, a, true'}, 'second action');
  });

  it('should return a valid second action again', function () {
    const action = secondAction(true, 222, ['a', 'b', 'c', 'd']);
    testAction(action, {one: true, two: 222, three: 'a, b, c, d'}, 'second action');
  });

  it('should dispatch actions', function () {
    reducer = createReducer({
      [firstAction]: (state, payload)=> {
        state.first += payload;
        return state;
      },
      [secondAction]: (state, payload)=> {
        state.second += '' + payload.one + payload.two + payload.three + ' - ';
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
