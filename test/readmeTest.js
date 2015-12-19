import chai from 'chai';
import {createStore, combineReducers} from 'redux';
import {assignAll, createAction, createReducer} from '../src/index';
import { ID } from '../src/constants';
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
    const append = createAction('optional description', (...args)=> args.join(''));

    // There is another pattern to create reducers
    const stringReducer = createReducer(function (on) {
      on(append, (state, payload)=> state += payload);
      on(replace, (state, payload)=> state = payload);
      // Warning! If you use the same action twice,
      // the second one will override the previous one.
    }, 'missing a lette'); // <-- Default state

    // If you only have one global store,
    // or want to bind an action to one particular store,
    // rather than binding them in each component, you can do it
    // once you've created both the store and your actions
    const stringStore = createStore(stringReducer);
    append.assignTo(stringStore);
    replace.assignTo(stringStore);

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
    expect(addTodoAction[ID]).to.be.a('number');
    expect(addTodoAction.type).to.be.a('string');
    expect(addTodoAction.payload).to.deep.equal('content');

    const editTodo = createAction('Edit todo', (id, content)=> ({id, content}));
    editTodo(42, 'the answer');
    // return { __id__: 2, type: '[2] Edit todo', payload: {id: 42, content: 'the answer'} }
    const editTodoAction = editTodo(42, 'the answer');
    expect(editTodoAction[ID]).to.be.a('number');
    expect(editTodoAction.type).to.be.a('string');
    expect(editTodoAction.payload).to.deep.equal({id: 42, content: 'the answer'});

    const serializeTodo = createAction('SERIALIZE_TODO');
    serializeTodo(1);
    // return { __id__: 'SERIALIZE_TODO', type: 'SERIALIZE_TODO', payload: 1 }
    const serializeTodoAction = serializeTodo(1);
    expect(serializeTodoAction[ID]).to.equal('SERIALIZE_TODO');
    expect(serializeTodoAction.type).to.equal('SERIALIZE_TODO');
    expect(serializeTodoAction.payload).to.equal(1);

    const action = createAction();
    const reducer = createReducer({
      [action]: (state)=> state * 2
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
});
