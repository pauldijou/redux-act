# redux-act

An opinionated lib to create actions and reducers for [Redux](https://github.com/rackt/redux). The main goal is to use actions themselves as references inside the reducers rather than string constants.

## Install

```bash
# NPM
npm install redux-act --save
# Yarn
yarn add redux-act
```

You can also use a [browser friendly compiled file](https://unpkg.com/redux-act@latest/dist/redux-act.js) or the [minified version](https://unpkg.com/redux-act@latest/dist/redux-act.min.js) from NPM CDN (mostly for online demo / snippets).

**Browser support**: this lib uses `String.prototype.startsWith` which is not supported by IE11. Be sure to add a polyfill if you are targeting this browser. [Learn more](https://github.com/pauldijou/redux-act/pull/77).

## Content

- [Usage](#usage)
- [FAQ](#faq)
- [Advanced usage](#advanced-usage)
- [API](#api)
  - [createAction](#createactiondescription-payloadreducer-metareducer)
  - [action creator](#action-creator)
  - [createReducer](#createreducerhandlers-defaultstate)
  - [reducer](#reducer)
  - [assignAll](#assignallactioncreators-stores)
  - [bindAll](#bindallactioncreators-stores)
  - [batch](#batchactions)
  - [disbatch](#disbatchstore--dispatch-actions)
  - [asError](#aserroraction)
  - [types](#types)
- [Cookbook](#cookbook)
  - [Compatibility](#compatibility)
  - [Adding and removing actions](#adding-and-removing-actions)
  - [Async actions](#async-actions)
  - [Enable or disable batch](#enable-or-disable-batch)
  - [TypeScript](#typescript)
- [Loggers](#loggers)
  - [Redux Logger](#redux-logger)

## Usage

Even if there is a function named `createAction`, it actually creates an `action creator` according to Redux glossary. It was just a bit overkill to name the function `createActionCreator`. If you are not sure if something is an action or an action creator, just remember that actions are plain objects while action creators are functions.

```javascript
// Import functions
import { createStore } from 'redux';
import { createAction, createReducer } from 'redux-act';

// Create an action creator (description is optional)
const add = createAction('add some stuff');
const increment = createAction('increment the state');
const decrement = createAction('decrement the state');

// Create a reducer
// (ES6 syntax, see Advanced usage below for an alternative for ES5)
const counterReducer = createReducer({
  [increment]: (state) => state + 1,
  [decrement]: (state) => state - 1,
  [add]: (state, payload) => state + payload,
}, 0); // <-- This is the default state

// Create the store
const counterStore = createStore(counterReducer);

// Dispatch actions
counterStore.dispatch(increment()); // counterStore.getState() === 1
counterStore.dispatch(increment()); // counterStore.getState() === 2
counterStore.dispatch(decrement()); // counterStore.getState() === 1
counterStore.dispatch(add(5)); // counterStore.getState() === 6
```

## FAQ

- **Does it work with Redux devtools?** Yes.

- **Do reducers work with combineReducers?** Of course, they are just normal reducers after all. Remember that according to the `combineReducers` checks, you will need to provide a default state when creating each reducer before combining them.

- **How does it work?** There is not much magic. A generated id is prepended to each action type and will be used inside reducers instead of the string constants used inside Redux by default.

- **Can you show how different it is from writing classic Redux?** Sure, you can check both commits to update [counter example](https://github.com/pauldijou/redux-act/commit/9e020137fb1b3e1e37d37c434032bec3c4e0873a) and [todomvc example](https://github.com/pauldijou/redux-act/commit/66a07913fdb36c9206e9bcbd5fa5577d1e6eceb7). You can also run both examples with `npm install && npm start` inside each folder.

- **Why having two syntax to create reducers?** The one with only a map of `action => reduce function` doesn't allow much. This is why the other one is here, in case you would need a small state inside the reducer, having something similar as an actor, or whatever you feel like. Also, one of the syntax is ES6 only.

- **Inside a reducer, why is it `(state, payload) => newState` rather than `(state, action) => newState`?** You can find more info about that on the `createReducer` API below, but basically, that's because an action is composed of metadata handled by the lib and your payload. Since you only care about that part, better to have it directly. You can switch back to the full action if necessary of course.

- **Why have you done that? Aren't string constants good enough?** I know that the Redux doc states that such magic isn't really good, that saving a few lines of code isn't worth hiding such logic. I can understand that. And don't get me wrong, the main goal of this lib isn't to reduce boilerplate (even if I like that it does) but to use the actions themselves as keys for the reducers rather than strings which are error prone. You never know what the new dev on your project might do... Maybe (s)he will not realize that the new constant (s)he just introduced was already existing and now everything is broken and a wormhole will appear and it will be the end of mankind. Let's prevent that!

## Advanced usage

```javascript
import { createStore } from 'redux';
import { createAction, createReducer } from 'redux-act';

// You can create several action creators at once
// (but that's probably not the best way to do it)
const [increment, decrement] = ['inc', 'dec'].map(createAction);

// When creating action creators, the description is optional
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
replace('a'); // stringStore.getState() === 'a'
append('b', 'c', 'd'); // stringStore.getState() === 'abcd'

// If you really need serializable actions, using string constant rather
// than runtime generated id, just use a uppercase description (with eventually some underscores)
// and it will be use as the id of the action
const doSomething = createAction('STRING_CONSTANT');
doSomething(1); // { type: 'STRING_CONSTANT', payload: 1}

// Little bonus, if you need to support metadata around your action,
// like needed data but not really part of the payload, you add a second function
const metaAction = createAction('desc', arg => arg, arg => 'so meta!');

// Metadata will be the third argument of the reduce function
createReducer({
  [metaAction]: (state, payload, meta) => payload
});
```

## API

### createAction([description], [payloadReducer], [metaReducer])

**Parameters**

- **description** (string, optional): used by logging and devtools when displaying the action. If this parameter is uppercase only, with underscores and numbers, it will be used as the action type without any generated id. You can use this feature to have serializable actions you can share between client and server.
- **payloadReducer** (function, optional): transform multiple arguments as a unique payload.
- **metaReducer** (function, optional): transform multiple arguments as a unique metadata object.

**Usage**

Returns a new [action creator](#action-creator). If you specify a description, it will be used by devtools. By default, `createAction` will return a function and its first argument will be used as the payload when dispatching the action. If you need to support multiple arguments, you need to specify a **payload reducer** in order to merge all arguments into one unique payload.

```javascript
// Super simple action
const simpleAction = createAction();
// Better to add a description
const betterAction = createAction('This is better!');
// Support multiple arguments by merging them
const multipleAction = createAction((text, checked) => ({text, checked}))
// Again, better to add a description
const bestAction = createAction('Best. Action. Ever.', (text, checked) => ({text, checked}))
// Serializable action (the description will be used as the unique identifier)
const serializableAction = createAction('SERIALIZABLE_ACTION_42');
```

### action creator

An action creator is basically a function that takes arguments and return an action which has the following format:

- `type`: generated id + your description.
- `payload`: the data passed when calling the action creator. Will be the first argument of the function except if you specified a payload reducer when creating the action.
- `meta`: if you have provided a **metaReducer**, it will be used to create a metadata object assigned to this key. Otherwise, it's `undefined`.
- `error`: a boolean indicating if the action is an error according to [FSA](https://github.com/acdlite/flux-standard-action#error).

```javascript
const addTodo = createAction('Add todo');
addTodo('content');
// return { type: '[1] Add todo', payload: 'content' }

const editTodo = createAction('Edit todo', (id, content) => ({id, content}));
editTodo(42, 'the answer');
// return { type: '[2] Edit todo', payload: {id: 42, content: 'the answer'} }

const serializeTodo = createAction('SERIALIZE_TODO');
serializeTodo(1);
// return { type: 'SERIALIZE_TODO', payload: 1 }
```

An action creator has the following methods:

**getType()**

Return the generated type that will be used by all actions from this action creator. Useful for [compatibility](#compatibility) purposes.

**assignTo(store | dispatch)**

Remember that you still need to dispatch those actions. If you already have one or more stores, you can assign the action using the `assignTo` function. This will mutate the action creator itself. You can pass one store or one dispatch function or an array of any of both.

```javascript
let action = createAction();
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
action(); // store.getState() === 4
action(); // store.getState() === 8

// You can assign the action to several stores using an array
action.assignTo([store, store2]);
action();
// store.getState() === 16
// store2.getState() === -2
```

**bindTo(store | dispatch)**

If you need immutability, you can use `bindTo`, it will return a new action creator which will automatically dispatch its action.

```javascript
// If you need more immutability, you can bind them, creating a new action creator
const boundAction = action2.bindTo(store);
action2(); // Not doing anything since not assigned nor bound
// store.getState() === 16
// store2.getState() === -2
boundAction(); // store.getState() === 8
```

**assigned() / bound() / dispatched()**

Test the current status of the action creator.

```javascript
const action = createAction();
action.assigned(); // false, not assigned
action.bound(); // false, not bound
action.dispatched(); // false, test if either assigned or bound

const boundAction = action.bindTo(store);
boundAction.assigned(); // false
boundAction.bound(); // true
boundAction.dispatched(); // true

action.assignTo(store);
action.assigned(); // true
action.bound(); // false
action.dispatched(); // true
```

**raw(...args)**

When an action creator is either assigned or bound, it will no longer only return the action object but also dispatch it. In some cases, you will need the action without dispatching it (when batching actions for example). In order to achieve that, you can use the `raw` method which will return the bare action. You could say that it is exactly the same as the action creator would behave it if wasn't assigned nor bound.

```javascript
const action = createAction().bindTo(store);
action(1); // store has been updated
action.raw(1); // return the action, store hasn't been updated
```

**asError(...args)***

By default, if your payload is an instance of `Error`, the action will be tagged as an error. But if you need to use any other kind of payload as an error payload, you can always use this method. It will apply the same payload reducer by setting the `error` to `true`.

```javascript
const actionCreator = createAction(value => {
  if (value > 10) { return new Error('Must be less than 10') }
  return { value: value }
})

const goodAction = actionCreator(5)
goodAction.error // false

const badAction = actionCreator(20)
badAction.error // true

const forcedBadAction = actionCreator.asError(1)
forcedBadAction.error // true
```

### createReducer(handlers, [defaultState])

**Parameters**

- **handlers** (object or function): if `object`, a map of action to the reduce function. If `function`, take two attributes: a function to register actions and another one to unregister them. See below.
- **defaultState** (anything, optional): the initial state of the reducer. Must not be empty if you plan to use this reducer inside a `combineReducers`.

**Usage**

Returns a new [reducer](#reducer). It's kind of the same syntax as the `Array.prototype.reduce` function. You can specify how to reduce as the first argument and the accumulator, or default state, as the second one. The default state is optional since you can retrieve it from the store when creating it but you should consider always having a default state inside a reducer, especially if you want to use it with `combineReducers` which make such default state mandatory.

There are two patterns to create a reducer. One is passing an object as a map of `action creators` to `reduce functions`. Such functions have the following signature: `(previousState, payload) => newState`. The other one is using a function factory. Rather than trying to explaining it, just read the following examples.

```javascript
const increment = createAction();
const add = createAction();

// First pattern
const reducerMap = createReducer({
  [increment]: (state) => state + 1,
  [add]: (state, payload) => state + payload
}, 0);

// Second pattern
const reducerFactory = createReducer(function (on, off) {
  on(increment, (state) => state + 1);
  on(add, (state, payload) => state + payload);
  // 'off' remove support for a specific action
  // See 'Adding and removing actions' section
}, 0);
```

### reducer

Like everything, a reducer is just a function. It takes the current state and an action payload and return the new state. It has the following methods.

**options({ payload: boolean, fallback: [handler] })**

Since an action is an object with a `type`, a `payload` (which is your actual data) and eventually some `metadata`, all reduce functions directly take the payload as their 2nd argument and the metadata as the 3rd by default rather than the whole action since all other properties are handled by the lib and you shouldn't care about them anyway. If you really need to use the full action, you can change the behavior of a reducer. Returns the reducer itself for chaining.

```javascript
const add = createAction();
const sub = createAction();
const reducer = createReducer({
  [add]: (state, action) => state + action.payload,
  [sub]: (state, action) => state - action.payload
}, 0);

reducer.options({
  payload: false
});
```

You can read [a more detailed explanation here](https://github.com/pauldijou/redux-act/issues/49).

If you specify a `fallback` handler, which has the exact same signature as any action handler inside the reducer, it will be called anytime you dispatch an action which is not handled by the reducer.

```javascript
const action = createAction();
const reducer = createReducer({}, 0);
reducer.options({
  // action is not handled, so fallback will be called
  fallback: (state, payload) => state + payload,
});
const store = createStore(reducer);
store.getState(); // 0
store.dispatch(action(5));
store.getState(); // 5
store.dispatch(action(-10));
store.getState(); // -5
```

**has(action creator)**

Test if the reducer has a reduce function for a particular action creator or a string type.

```javascript
const add = createAction();
const sub = createAction();
const reducer = createReducer({
  [add]: (state, action) => state + action.payload
}, 0);

reducer.has(add); // true
reducer.has(sub); // false
reducer.has(add.getType()); // true
```

**on(action creator | action creator[], reduce function)**
**off(action creator | action creator[])**

You can dynamically add and remove actions. See the [adding and removing actions](#adding-and-removing-actions) section for more infos. You can use either a `redux-act` action creator or a raw string type. You can also use array of those, it will apply the `on` or `off` function to all elements.

They both return the reducer itself so you can chain them.

### assignAll(actionCreators, stores)

**Parameters**

- **actionCreators** (object or array): which action creators to assign. If it's an object, it's a map of name -> action creator, useful when importing several actions at once.
- **stores** (object or array): the target store(s) when dispatching actions. Can be only one or several inside an array.

**Usage**

A common pattern is to export a set of action creators as an object. If you want to bind all of them to a store, there is this super small helper. You can also use an array of action creators. And since you can bind to one or several stores, you can specify either one store or an array of stores.

```javascript
// actions.js
export const add = createAction('Add');
export const sub = createAction('Sub');

// reducer.js
import * as actions from './actions';
export default createReducer({
  [actions.add]: (state, payload) => state + payload,
  [actions.sub]: (state, payload) => state - payload
}, 0);

// store.js
import * as actions from './actions';
import reducer from './reducer';

const store = createStore(reducer);
assignAll(actions, store);

export default store;
```

### bindAll(actionCreators, stores)

**Parameters**

- **actionCreators** (object or array): which action creators to bind. If it's an object, it's a map of name -> action creator, useful when importing several actions at once.
- **stores** (object or array): the target store(s) when dispatching actions. Can be only one or several inside an array.

**Usage**

Just like `assignAll`, you can bind several action creators at once.

```javascript
import { bindAll } from 'redux-act';
import store from './store';
import * as actions from './actions';

export bindAll(actions, store);
```

### batch(actions)

**Parameters**

- **actions** (objects | array): wrap an array of actions inside another action and will reduce them all at once when dispatching it. You can also call this function with several actions as arguments.

:warning: **Warning** Does not work with assigned and bound actions by default since those will be dispatched immediately when called. You will need to use the `raw` method for such actions. See usage below.

**Usage**

Useful when you need to run a sequence of actions without impacting your whole application after each one but rather after all of them are done. For example, if you are using `@connect` from `react-redux`, it is called after each action by default. Using `batch`, it will be called only when all actions in the array have been reduced.

`batch` is an action creator like any other created using `createAction`. You can assign or bind it if you want, especially if you only have one store. You can even use it inside reducers. It is enabled by default, but you can remove it and put it back.

```javascript
import { createAction, createReducer, batch } from 'redux-act';

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

// Assigned actions
inc.assignTo(store);
dec.assignTo(store);

// You still need to dispatch the batch action
// You will need to use the 'raw' function on the action creators to prevent
// the auto-dipatch from the assigned action creators
store.dispatch(batch(inc.raw(), dec.raw(), dec.raw()));
store.dispatch(batch([inc.raw(), dec.raw(), dec.raw()]));
store.getState(); // 2

// Let's de-assign our actions
inc.assignTo(undefined);
dec.assignTo(undefined);

// You can bind batch
const boundBatch = batch.bindTo(store);
boundBatch(inc(), inc());
store.getState(); // 4

// You can assign batch
batch.assignTo(store);
batch(dec(), dec(), dec());
store.getState(); // 1

// You can remove batch from a reducer
reducer.off(batch);
batch(dec(), dec());
store.getState(); // 1

// You can put it back
reducer.on(batch, (state, payload) => payload.reduce(reducer, state));
batch(dec(), dec());
store.getState(); // -1
```

### disbatch(store | dispatch, [actions])

**Parameters**

- **store | dispatch** (object, which is a Redux store, or a dispatch function): add a `disbatch` function to the store if it is the only parameter. Just like `dispatch` but for several actions which will be batched as a single one.
- **actions** (array, optional): the array of actions to dispatch as a batch of actions.

**Usage**

```javascript
// All samples will display both syntax with and without an array
// They are exactly the same
import { disbatch } from 'redux-act';
import { inc, dec } from './actions';

// Add 'disbatch' directly to the store
disbatch(store);
store.disbatch(inc(), dec(), inc());
store.disbatch([inc(), dec(), inc()]);

// Disbatch immediately from store
disbatch(store, inc(), dec(), inc());
disbatch(store, [inc(), dec(), inc()]);

// Disbatch immediately from dispatch
disbatch(store.dispatch, inc(), dec(), inc());
disbatch(store.dispatch, [inc(), dec(), inc()]);
```

### asError(action)

**Parameters**

- **action** (object): a standard Redux action (with a `type` property)

Set the `error` property to `true`.

```javascript
import { createAction, asError } from 'redux-act';

const goodAction = createAction();
goodAction.error; // false

const badAction = asError(goodAction);
badAction.error; // true
```

### types

**This is mostly internal stuff and is exposed only to help during development and testing.**

As you know it, each action has a type. `redux-act` will ensure that each action creator type is unique. If you are not using serializable actions, you are good to go as all types will be dynamically generated and unique. But if you do use them, by default, nothing prevent you from creating two action creators with the same type. `redux-act` will throw if you call `createAction` with an already used type, and that is good, except when running tests.

During testing, you might need to reset all types, start as fresh, to prevent `redux-act` to throw between tests. To do so, you have a small API to manage types stored by `redux-act`.

```javascript
import { types } from 'redux-act';

// Add a type and prevent any action creator from using it from now on
types.add('MY_TYPE');
types.add('MY_TYPE_BIS');

// Remove a type, you can use it again in an action creator
types.remove('MY_TYPE_BIS');

// Test if a type is already used
types.has('MY_TYPE'); // true
types.has('MY_TYPE_BIS'); // false

// Check if a type is already used,
// will throw TypeError if so
types.check('MY_TYPE') // throw TypeError
types.check('MY_TYPE_BIS') // do nothing (return undefined)

// Return all used types
types.all(); // [ 'MY_TYPE' ]

// Remove all types
types.clear();

// Disable all type checking meaning you can now have several actions
// with the same type. This is needed for HMR (Hot Module Replacement)
// but never never never enable it in production
types.disableChecking();

// Set back type checking
types.enableChecking();
```

## Cookbook

### Compatibility

`redux-act` is fully compatible with any other Redux library, it just uses `type` string after all.

:warning: **Warning** It's important to remember that all `redux-act` actions will store data inside the `payload` property and that reducers will automatically extract it by default.

```javascript
// Mixing basic and redux-act actions inside a reducer
import { createAction, createReducer } from 'redux-act';

// Standard Redux action using a string constant
const INCREMENT_TYPE = 'INCREMENT';
const increment = () => ({ type: INCREMENT_TYPE });

const decrement = createAction('decrement');

const reducer = createReducer({
  [INCREMENT_TYPE]: (state) => state + 1,
  [decrement]: (state) => state - 1,
}, 0);

reducer.has(INCREMENT_TYPE); // true
reducer.has(decrement); // true
```

```javascript
// Using redux-act actions inside a basic reducer
import { createAction } from 'redux-act';

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
```

### Adding and removing actions

Using the handlers object.

```javascript
const handlers = {};
const reducer = createReducer(handlers, 0);
const store = createStore(reducer);
const increment = createAction().assignTo(store);

handlers[increment] = (state) => state + 1;

increment(); // store.getState() === 1
increment(); // store.getState() === 2

delete(handlers[increment]);

increment(); // store.getState() === 2
increment(); // store.getState() === 2
```

Using the `on` and `off` functions of the reducer. Those functions will be available whatever pattern you used to create the reducer.

```javascript
const reducer = createReducer({}, 0);
const store = createStore(reducer);
const increment = createAction().assignTo(store);

reducer.on(increment, (state) => state + 1);

increment(); // store.getState() === 1
increment(); // store.getState() === 2

reducer.off(increment);

increment(); // store.getState() === 2
increment(); // store.getState() === 2
```

Using the `on` and `off` functions of the function factory when creating the reducer.

```javascript
const store = createStore(()=> 0));
const increment = createAction().assignTo(store);
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

store.replaceReducer(reducer);

increment(); // store.getState() === 1
increment(); // store.getState() === 2
increment(); // store.getState() === 3
increment(); // store.getState() === 3
increment(); // store.getState() === 3
```

### Async actions

```javascript
import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {createAction, createReducer} from 'redux-act';

const start = createAction();
const success = createAction();

const reducer = createReducer({
  [start]: (state) => ({ ...state, running: true }),
  [success]: (state, result) => ({ running: false, result })
}, {
  running: false,
  result: false
});

// 1) You can use the same way as the Redux samples
// using thunk middleware
const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware
)(createStore);

const store = createStoreWithMiddleware(reducer);

function fetch() {
  // We don't really need the dispatch
  // but here it is if you don't bind your actions
  return function (dispatch) {
    // state: { running: false, result: false }
    dispatch(start());
    // state: { running: true, result: false }
    return new Promise(resolve => {
      // Here, you should probably do a real async call,
      // like, you know, XMLHttpRequest or Global.fetch stuff
      setTimeout(() =>
        resolve(1)
      , 5);
    }).then(result=>
      dispatch(success(result))
      // state: { running: false, result: 1 }
    );
  };
}

store.dispatch(fetch()).then(() => {
  // state: { running: false, result: 1 }
});

// 2) You can enjoy the redux-act binding
// and directly call the actions
const store = createStore(reducer);

start.assignTo(store);
success.assignTo(store);

function fetch() {
  // state: { running: false, result: false }
  start();
  // state: { running: true, result: false }
  return new Promise(resolve => {
    // Here, you should probably do a real async call,
    // like, you know, XMLHttpRequest or Global.fetch stuff
    setTimeout(() =>
      resolve(1)
    , 5);
  }).then(result=>
    success(result)
    // state: { running: false, result: 1 }
  );
}

fetch().then(() => {
  // state: { running: false, result: 1 }
});
```

### Enable or disable batch

Since `batch` is an action creator like any other, you can add and remove it from any reducer.

```javascript
import { createReducer, batch } from 'redux-act';
const reducer = createReducer({});

// Reducer no longer support batched actions
reducer.off(batch);

// Put it back using the reducer itself as the reduce function
reducer.on(batch, (state, payload) => payload.reduce(reducer, state));

// Be careful if 'payload' option is false
reducer.options({ payload: false });
reducer.on(batch, (state, action) => action.payload.reduce(reducer, state));
```

### TypeScript

We've built some basic typings around this API that will help TypeScript identify potential issues in your code.

You can use any of the existing methods to create reducers and TypeScript will work (as a superset of Javascript) but that kind of defeats some of the benefits of TypeScript. For this reason, the following is the recommended way to create a reducer.

```typescript
import { createReducer, createAction } from 'redux-act';

const defaultState = {
	count: 0,
  otherProperties: any,
  ...
};

const add = createAction<number>('Increase count');

const reducer = createReducer<typeof defaultState>({}, defaultState);

reducer.on(add, (state, payload) => ({
	...state,
	count: state.count + payload
}));
```

Using the `reducer.on()` API, TypeScript will identify the payload set on `add` and provide that type as payload. This can be really handy once your code starts scaling up.

#### Caveats

Due to some limitations on TypeScript typings, action creators have some limitations but you can create typed action creators assuming you have no payload reducer.

```typescript
import { createAction } from 'redux-act';

const action = createAction<boolean>('Some type');
const emptyAction = createAction('Another type');
const otherAction = createAction<boolean>('Other action', (arg1, arg2) => ({ arg1, arg2 }));
```

`action` and `emptyAction` will provide typing support, making sure `action` is provided a boolean as first and only argument, or `emptyAction` is not provided any argument at all.

`otherAction`, on the otherhand, will be able to be called with any arguments, regardless of what the payload reducer expects.


## Loggers

`redux-act` provides improved logging with some loggers, mostly for batched actions.

Missing your favorite one? Please open an issue or a pull request, it will be added as soon as possible.

### [Redux Logger](https://github.com/fcomb/redux-logger)

```javascript
import { applyMiddleware, createStore } from 'redux';
import createLogger from 'redux-logger';
import { loggers } from 'redux-act';

// Init logger
const logger = createLogger({
  ...loggers.reduxLogger,
  // You can  add you own options after that
});

// Same as
const logger = createLogger({
  actionTransformer: loggers.reduxLogger.actionTransformer,
  logger: loggers.reduxLogger.logger,
  // You can  add you own options after that
});

// Create the store
const store = applyMiddleware(logger)(createStore)(/* reducer */);
```

## Thanks

A big thank to both [@gaearon](https://github.com/gaearon) for creating [Redux](https://github.com/rackt/redux) and [@AlexGalays](https://github.com/AlexGalays) for creating [fluxx](https://github.com/AlexGalays/fluxx) which I took a lot of inspiration from.

## Tests

If you need to run the tests, just use `npm test` or `npm run coverage` if you want to generate the coverage report.

## License

This software is licensed under the Apache 2 license, quoted below.

Copyright 2015 Paul Dijou ([http://pauldijou.fr](http://pauldijou.fr)).

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this project except in compliance with the License. You may obtain a copy of the License at [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0).

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
