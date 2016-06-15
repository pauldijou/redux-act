import chai from 'chai';
import spies from 'chai-spies';
import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {createAction, createReducer} from '../src/index';
const expect = chai.expect;
chai.use(spies);

describe('createAction', function () {
  let firstAction, secondAction, reducer;

  function testActionCreator(actionCreator) {
    expect(actionCreator).to.be.a('function');
    expect(actionCreator.toString).to.be.a('function');
    expect(actionCreator.assignTo).to.be.a('function');
  }

  function testAction(action, payload, description, meta) {
    expect(action).to.be.an('object');
    expect(action).to.contain.keys('type', 'payload');
    expect(action.type).to.be.a('string');
    if (typeof description === 'string') {
      expect(action.type).to.contain(description);
    }
    expect(action.payload).to.deep.equal(payload);
    if (typeof meta !== 'undefined') {
      expect(action).to.contain.keys('meta');
      expect(action.meta).to.deep.equal(meta);
    }
  }

  function testSerializableAction(action, description, payload, meta) {
    expect(action).to.be.an('object');
    expect(action).to.contain.keys('type', 'payload');
    expect(action.type).to.equal(description);
    expect(action.payload).to.deep.equal(payload);
    if (typeof meta !== 'undefined') {
      expect(action).to.contain.keys('meta');
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

  it('should support all format with serializable syntax', function () {
    const description = createAction('DESCRIPTION_ACTION');
    const args = createAction('ARGS_ACTION', (num, text)=> ({one: num, text}));
    const both = createAction('BOTH_ACTION', (id, content)=> ({id, content}));
    const meta = createAction('META_ACTION', (id, content)=> ({id, content}), (id, content) => ({more: true, prepend: 'hello ' + content}));

    testActionCreator(description);
    testActionCreator(args);
    testActionCreator(both);
    testActionCreator(meta);

    const descriptionAction = description(true);
    const argsAction = args(4, 'hello');
    const bothAction = both(2, 'world');
    const metaAction = meta(2, 'world');

    testSerializableAction(descriptionAction, 'DESCRIPTION_ACTION', true);
    testSerializableAction(argsAction, 'ARGS_ACTION', {one: 4, text: 'hello'});
    testSerializableAction(bothAction, 'BOTH_ACTION', {id: 2, content: 'world'});
    testSerializableAction(metaAction, 'META_ACTION', {id: 2, content: 'world'}, {more: true, prepend: 'hello world'});
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

  it('should not create duplicate serializable action creators', function () {
    const action1 = createAction('THE_ACTION');
    expect(() => {
      const action2 = createAction('THE_ACTION');
    }).to.throw('Duplicate action type: THE_ACTION');
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

  it('should assign to a store', function () {
    const store = createStore(reducer, {first: 0, second: ''});
    firstAction.assignTo(store);
    secondAction.assignTo(store);

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

  it('should bind to a store', function () {
    const store = createStore(reducer, {first: 0, second: ''});
    const bfirstAction = firstAction.bindTo(store);
    const bsecondAction = secondAction.bindTo(store);

    bfirstAction(1);
    expect(store.getState()).to.deep.equal({first: 1, second: ''});

    bsecondAction(1, '2', [3, '4']);
    expect(store.getState()).to.deep.equal({first: 1, second: '123, 4 - '});

    bfirstAction(20);
    bfirstAction(21);
    expect(store.getState()).to.deep.equal({first: 42, second: '123, 4 - '});

    bsecondAction(true, 0, ['a', false]);
    expect(store.getState()).to.deep.equal({first: 42, second: '123, 4 - true0a, false - '});
  });

  it('should chain correctly using assignTo', function () {
    const actions = {};
    const reducer = createReducer(actions, 0);
    const store = createStore(reducer);
    const action = createAction().assignTo(store);
    actions[action] = (state)=> state + 1;

    action();
    expect(store.getState()).to.equal(1);
    action();
    expect(store.getState()).to.equal(2);
    action();
    expect(store.getState()).to.equal(3);
  });

  it('should support fake async action', function (done) {
    const start = createAction();
    const success = createAction();

    const reducer = createReducer({
      [start]: (state)=> ({ ...state, running: true }),
      [success]: (state, result)=> ({ running: false, result })
    }, {
      running: false,
      result: false
    });

    const store = createStore(reducer);

    start.assignTo(store);
    success.assignTo(store);

    function fetch() {
      start();
      setTimeout(()=> {
        expect(store.getState().running).to.be.true;
        expect(store.getState().result).to.be.false;
        success(1);
        expect(store.getState().running).to.be.false;
        expect(store.getState().result).to.equal(1);
        done();
      }, 5);
    }

    expect(store.getState().running).to.be.false;
    expect(store.getState().result).to.be.false;
    fetch();
    expect(store.getState().running).to.be.true;
    expect(store.getState().result).to.be.false;
  });

  it('should support async action', function (done) {
    const start = createAction();
    const success = createAction();

    const reducer = createReducer({
      [start]: (state)=> ({ ...state, running: true }),
      [success]: (state, result)=> ({ running: false, result })
    }, {
      running: false,
      result: false
    });

    const createStoreWithMiddleware = applyMiddleware(
      thunkMiddleware
    )(createStore);

    const store = createStoreWithMiddleware(reducer);

    function fetch() {
      // We don't really need the dispatch
      // but here it is if you don't bind your actions
      return function (dispatch) {
        dispatch(start());
        return new Promise(resolve => {
          setTimeout(()=>
            resolve(1)
          , 5);
        }).then(result=>
          dispatch(success(result))
        );
      };
    }

    expect(store.getState().running).to.be.false;
    expect(store.getState().result).to.be.false;

    store.dispatch(fetch()).then(()=> {
      expect(store.getState().running).to.be.false;
      expect(store.getState().result).to.equal(1);
      done();
    });

    expect(store.getState().running).to.be.true;
    expect(store.getState().result).to.be.false;
  });

  it('should support async action without thunk', function (done) {
    const start = createAction();
    const success = createAction();

    const reducer = createReducer({
      [start]: (state)=> ({ ...state, running: true }),
      [success]: (state, result)=> ({ running: false, result })
    }, {
      running: false,
      result: false
    });

    const store = createStore(reducer);

    start.assignTo(store);
    success.assignTo(store);

    function fetch() {
      start();
      return new Promise(resolve => {
        setTimeout(()=>
          resolve(1)
        , 5);
      }).then(result=>
        success(result)
      );
    }

    expect(store.getState().running).to.be.false;
    expect(store.getState().result).to.be.false;

    fetch().then(()=> {
      expect(store.getState().running).to.be.false;
      expect(store.getState().result).to.equal(1);
      done();
    });

    expect(store.getState().running).to.be.true;
    expect(store.getState().result).to.be.false;
  });

  it('should return current status', function () {
    const spy = chai.spy.on(console, 'warn');
    expect(spy).to.have.been.called.exactly(0);

    const store = createStore(() => 0);
    const action = createAction();
    expect(action.assigned()).to.be.false;
    expect(action.bound()).to.be.false;
    expect(action.binded()).to.be.false;
    expect(spy).to.have.been.called.exactly(1);
    expect(action.dispatched()).to.be.false;

    action.assignTo(store);
    expect(action.assigned()).to.be.true;
    expect(action.bound()).to.be.false;
    expect(action.binded()).to.be.false;
    expect(spy).to.have.been.called.exactly(2);
    expect(action.dispatched()).to.be.true;

    const boundAction = action.bindTo(store);
    expect(boundAction.assigned()).to.be.false;
    expect(boundAction.bound()).to.be.true;
    expect(boundAction.binded()).to.be.true;
    expect(spy).to.have.been.called.exactly(3);
    expect(boundAction.dispatched()).to.be.true;

    action.assignTo(undefined);
    expect(action.assigned()).to.be.false;
    expect(action.bound()).to.be.false;
    expect(action.binded()).to.be.false;
    expect(spy).to.have.been.called.exactly(4);
    expect(action.dispatched()).to.be.false;
  });

  it('should not be assignable nor bindable once bound', function () {
    const store = createStore(() => 0);
    const action = createAction().bindTo(store);
    expect(action).to.equal(action.assignTo(store));
    expect(action).to.equal(action.bindTo(store));
  });

  it('should return raw actions', function () {
    const action = createAction();
    const reducer = createReducer({
      [action]: (state) => state + 1
    }, 0);
    const store = createStore(reducer);

    testActionCreator(action);
    testAction(action(1), 1);
    testAction(action.raw(1), 1);
    expect(store.getState()).to.equal(0);

    action.assignTo(store);
    testAction(action.raw(1), 1);
    expect(store.getState()).to.equal(0);

    const boundAction = action.bindTo(store);
    testAction(boundAction.raw(1), 1);
    expect(store.getState()).to.equal(0);
  });
});
