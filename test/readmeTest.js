import chai from 'chai';
import {createStore, combineReducers} from 'redux';
import {assignAll, bindAll, createAction, createReducer, batch, disbatch} from '../src/index';
const expect = chai.expect;

describe('README', function () {
  it('should validate usage section', function () {
    // Create an action creator (description is optional)
    const add = createAction('add some stuff');

    // You can create several action creators at once
    const [increment, decrement] = ['inc', 'dec'].map(createAction);

    // Create a reducer
    const counterReducer = createReducer({
      [increment]: (state)=> state + 1,
      [decrement]: (state)=> state - 1,
      [add]: (state, payload)=> state + payload
    }, 0); // <-- This is the default state

    // Create the store
    const counterStore = createStore(counterReducer);

    // Dispatch actions
    counterStore.dispatch(increment()); // counterStore.getState() === 1
    expect(counterStore.getState()).to.equal(1);
    counterStore.dispatch(increment()); // counterStore.getState() === 2
    expect(counterStore.getState()).to.equal(2);
    counterStore.dispatch(decrement()); // counterStore.getState() === 1
    expect(counterStore.getState()).to.equal(1);
    counterStore.dispatch(add(5)); // counterStore.getState() === 6
    expect(counterStore.getState()).to.equal(6);
  });

  it('should validate advanced usage section', function () {
    // When creating actions, the description is optional
    // it will only be used for devtools and logging stuff.
    // It's better to put something but feel free to leave it empty if you want to.
    const replace = createAction();

    // By default, the payload of the action is the first argument
    // when you call the action. If you need to support several arguments,
    // you can specify a function on how to merge all arguments into
    // an unique payload.
    let append = createAction('optional description', (...args) => args.join(''));

    // There is another pattern to create reducers
    // and it works fine with ES5! (maybe even ES3 \o/)
    const stringReducer = createReducer(function (on) {
      on(replace, (state, payload) => payload);
      on(append, (state, payload) => state += payload);
      // Warning! If you use the same action twice,
      // the second one will override the previous one.
    }, 'missing a lette'); // <-- Default state

    // Rather than binding the action creators each time you want to use them,
    // you can do it once and for all as soon as you have the targeted store
    // assignTo: mutates the action creator itself
    // bindTo: returns a new action creator assigned to the store
    const stringStore = createStore(stringReducer);
    replace.assignTo(stringStore);
    append = append.bindTo(stringStore);

    // Now, when calling actions, they will be automatically dispatched
    append('r'); // stringStore.getState() === 'missing a letter'
    expect(stringStore.getState()).to.equal('missing a letter');
    replace('a'); // stringStore.getState() === 'a'
    expect(stringStore.getState()).to.equal('a');
    append('b', 'c', 'd'); // stringStore.getState() === 'abcd'
    expect(stringStore.getState()).to.equal('abcd');
  });

  it('should validate createAction API', function () {
    const addTodo = createAction('Add todo');
    addTodo('content');
    // return { __id__: 1, type: '[1] Add todo', payload: 'content' }
    const addTodoAction = addTodo('content');
    expect(addTodoAction.type).to.be.a('string');
    expect(addTodoAction.payload).to.deep.equal('content');

    const editTodo = createAction('Edit todo', (id, content)=> ({id, content}));
    editTodo(42, 'the answer');
    // return { __id__: 2, type: '[2] Edit todo', payload: {id: 42, content: 'the answer'} }
    const editTodoAction = editTodo(42, 'the answer');
    expect(editTodoAction.type).to.be.a('string');
    expect(editTodoAction.payload).to.deep.equal({id: 42, content: 'the answer'});

    const serializeTodo = createAction('SERIALIZE_TODO');
    serializeTodo(1);
    // return { __id__: 'SERIALIZE_TODO', type: 'SERIALIZE_TODO', payload: 1 }
    const serializeTodoAction = serializeTodo(1);
    expect(serializeTodoAction.type).to.equal('SERIALIZE_TODO');
    expect(serializeTodoAction.payload).to.equal(1);

    const action = createAction();
    let action2 = createAction();
    const reducer = createReducer({
      [action]: (state) => state * 2,
      [action2]: (state) => state / 2,
    });
    const store = createStore(reducer, 1);
    const store2 = createStore(reducer, -1);

    // Automatically dispatch the action to the store when called
    action.assignTo(store);
    action(); // store.getState() === 2
    expect(store.getState()).to.equal(2);
    action(); // store.getState() === 4
    expect(store.getState()).to.equal(4);
    action(); // store.getState() === 8
    expect(store.getState()).to.equal(8);

    // You can bind the action to several stores using an array
    action.assignTo([store, store2]);
    action();
    // store.getState() === 16
    // store2.getState() === -2
    expect(store.getState()).to.equal(16);
    expect(store2.getState()).to.equal(-2);

    // You can un-assign
    action.assignTo(undefined);
    action(); // store.getState() === 16
    expect(store.getState()).to.equal(16);

    // If you need more immutability, you can bind them, creating a new action creator
    const boundAction = action2.bindTo(store);
    action2(); // Not doing anything since not assigned nor bound
    // store.getState() === 16
    expect(store.getState()).to.equal(16);
    // store2.getState() === -2
    expect(store2.getState()).to.equal(-2);
    boundAction(); // store.getState() === 8
    expect(store.getState()).to.equal(8);

    // You can test the status of your action creator
    action.assigned(); // false, not assigned anymore
    action.bound(); // false, not bound
    action.dispatched(); // false, test if either assigned or bound
    expect(action.assigned()).to.be.false;
    expect(action.bound()).to.be.false;
    expect(action.dispatched()).to.be.false;

    boundAction.assigned(); // false
    boundAction.bound(); // true
    boundAction.dispatched(); // true
    expect(boundAction.assigned()).to.be.false;
    expect(boundAction.bound()).to.be.true;
    expect(boundAction.dispatched()).to.be.true;

    action.assignTo(store);
    action.assigned(); // true
    action.bound(); // false
    action.dispatched(); // true
    expect(action.assigned()).to.be.true;
    expect(action.bound()).to.be.false;
    expect(action.dispatched()).to.be.true;
  });

  it('should validate createReducer API 1', function () {
    const increment = createAction();
    const add = createAction();

    // First pattern
    const reducerMap = createReducer({
      [increment]: (state)=> state + 1,
      [add]: (state, payload)=> state + payload
    }, 0);

    // Second pattern
    const reducerFactory = createReducer(function (on) {
      on(increment, (state)=> state + 1);
      on(add, (state, payload)=> state + payload);
    }, 0);
  });

  it('should validate createReducer API 2', function () {
    const handlers = {};
    const reducer = createReducer(handlers, 0);
    const store = createStore(reducer);

    const increment = createAction().assignTo(store);
    handlers[increment] = (state)=> state + 1;

    increment(); // store.getState() === 1
    expect(store.getState()).to.equal(1);
    increment(); // store.getState() === 2
    expect(store.getState()).to.equal(2);

    delete(handlers[increment]);

    increment(); // store.getState() === 2
    expect(store.getState()).to.equal(2);
    increment(); // store.getState() === 2
    expect(store.getState()).to.equal(2);
  });

  it('should validate createReducer API 3', function () {
    // Using the 'on' and 'off' functions of the reducer
    // Those functions will be available whatever pattern
    // you used to create the reducer
    const reducer = createReducer({}, 0);
    const store = createStore(reducer);
    const increment = createAction().assignTo(store);

    reducer.on(increment, (state)=> state + 1);

    increment(); // store.getState() === 1
    expect(store.getState()).to.equal(1);
    increment(); // store.getState() === 2
    expect(store.getState()).to.equal(2);

    reducer.off(increment);

    increment(); // store.getState() === 2
    expect(store.getState()).to.equal(2);
    increment(); // store.getState() === 2
    expect(store.getState()).to.equal(2);
  });

  it('should validate createReducer API 3', function () {
    // Using the 'on' and 'off' functions of the function factory
    // when creating the reducer
    const increment = createAction();
    const reducer = createReducer(function (on, off) {
      on(increment, state => {
        // Just for fun, we will disable increment when reaching 2
        // (but we will still increment one last time)
        if (state === 2) {
          off(increment);
        }
        return state + 1;
      });
    }, 0);

    const store = createStore(reducer);
    increment.assignTo(store);

    increment(); // store.getState() === 1
    expect(store.getState()).to.equal(1);
    increment(); // store.getState() === 2
    expect(store.getState()).to.equal(2);
    increment(); // store.getState() === 3
    expect(store.getState()).to.equal(3);
    increment(); // store.getState() === 3
    expect(store.getState()).to.equal(3);
    increment(); // store.getState() === 3
    expect(store.getState()).to.equal(3);
  });

  it('should validate has sample', function () {
    const add = createAction();
    const sub = createAction();
    const reducer = createReducer({
      [add]: (state, action) => state + action.payload
    }, 0);

    reducer.has(add); // true
    reducer.has(sub); // false
    reducer.has(add.getType()); // true

    expect(reducer.has(add)).to.be.true;
    expect(reducer.has(sub)).to.be.false;
    expect(reducer.has(add.getType())).to.be.true;
  });

  it('should validate batch API', function () {
    // Basic actions
    const inc = createAction();
    const dec = createAction();

    const reducer = createReducer({
      [inc]: state => state + 1,
      [dec]: state => state - 1,
    }, 0);

    const store = createStore(reducer);
    // actions as arguments
    store.dispatch(batch(inc(), inc(), dec(), inc()));
    // actions as an array
    store.dispatch(batch([inc(), inc(), dec(), inc()]));
    store.getState(); // 4
    expect(store.getState()).to.equal(4);

    // bound actions
    inc.assignTo(store);
    dec.assignTo(store);

    // You still need to dispatch the batch action
    // You will need to use the 'raw' function on the action creators to prevent
    // the auto-dipatch from the binding
    store.dispatch(batch(inc.raw(), dec.raw(), dec.raw()));
    store.dispatch(batch([inc.raw(), dec.raw(), dec.raw()]));
    store.getState(); // 2
    expect(store.getState()).to.equal(2);

    // Let's de-assign our actions
    inc.assignTo(undefined);
    dec.assignTo(undefined);

    // You can bind batch
    const boundBatch = batch.bindTo(store);
    boundBatch(inc(), inc());
    store.getState(); // 4
    expect(store.getState()).to.equal(4);

    // You can assign batch
    batch.assignTo(store);
    batch(dec(), dec(), dec());
    store.getState(); // 1
    expect(store.getState()).to.equal(1);

    // You can remove batch from a reducer
    reducer.off(batch);
    batch(dec(), dec());
    store.getState(); // 1
    expect(store.getState()).to.equal(1);

    // You can put it back
    reducer.on(batch, (state, payload) => payload.reduce(reducer, state));
    batch(dec(), dec());
    store.getState(); // -1
    expect(store.getState()).to.equal(-1);
  });

  it('should validate compatibility section 1', function () {
    // Mixing basic and redux-act actions inside a reducer

    // Standard Redux action using a string constant
    const INCREMENT_TYPE = 'INCREMENT';
    const increment = () => ({ type: INCREMENT_TYPE });

    const decrement = createAction('decrement');

    const reducer = createReducer({
      [INCREMENT_TYPE]: (state) => state + 1,
      [decrement]: (state) => state - 1,
    }, 0);

    expect(reducer.has(INCREMENT_TYPE)).to.be.true;
    expect(reducer.has(decrement)).to.be.true;

    const store = createStore(reducer);
    expect(store.getState()).to.equal(0);
    store.dispatch(increment());
    expect(store.getState()).to.equal(1);
    store.dispatch(increment());
    expect(store.getState()).to.equal(2);
    store.dispatch(decrement());
    expect(store.getState()).to.equal(1);
  });

  it('should validate compatibility section 2', function () {
    // Using redux-act actions inside a basic reducer

    // Standard Redux action using a string constant
    const INCREMENT_TYPE = 'INCREMENT';
    const increment = () => ({ type: INCREMENT_TYPE });

    const decrement = createAction('decrement');

    function reducer(state = 0, action) {
      switch (action.type) {
      case INCREMENT_TYPE:
        return state + 1;
        break;
      case decrement.getType():
        return state - 1;
        break;
      default:
        return state;
      }
    };

    const store = createStore(reducer);
    expect(store.getState()).to.equal(0);
    store.dispatch(increment());
    expect(store.getState()).to.equal(1);
    store.dispatch(increment());
    expect(store.getState()).to.equal(2);
    store.dispatch(decrement());
    expect(store.getState()).to.equal(1);
  });
});
