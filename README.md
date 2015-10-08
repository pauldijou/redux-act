# redux-act

An opinionated lib to create actions and reducers for [Redux](https://github.com/rackt/redux). The main goal is to use actions themselves as references inside the reducers rather than string constants.

## Install

```bash
npm install redux-act --save
```

## Content

- [Usage](#usage)
- [FAQ](#faq)
- [Avanced usage](#advanced-usage)
- [API](#api)
  - [createAction](#createactiondescription-payloadreducer-metareducer)
  - [createReducer](#createreducerhandlers-defaultstate)
  - [bindAll](#bindallactioncreators-stores)
- [Cookbook](#cookbook)
  - [Async actions](#async-actions)

## Usage

Even if there is a function named `createAction`, it actually creates an `action creator` according to Redux glossary. It was just a bit overkill to name the function `createActionCreator`. If you are not sure if something is an action or an action creator, just remember that actions are plain objects while action creators are functions.

```javascript
// Import functions
import { createStore } from 'redux';
import { createAction, createReducer } from 'redux-act';

// Create an action creator (description is optional)
const add = createAction('add some stuff');

// You can create several action creators at once
const [increment, decrement] = ['inc', 'dec'].map(createAction);

// Create a reducer
// (ES6 syntax, see Advanced usage below for an alternative for ES5)
const counterReducer = createReducer({
  [increment]: (state)=> state + 1,
  [decrement]: (state)=> state - 1,
  [add]: (state, payload)=> state + payload
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

- **How does it work?** There is not much magic. A generated id is assigned to each created action and will be used inside reducers instead of the string constants used inside Redux by default.

- **Can you show how different it is from writing classic Redux?** Sure, you can check both commits to update [counter example](https://github.com/pauldijou/redux-act/commit/9e020137fb1b3e1e37d37c434032bec3c4e0873a) and [todomvc example](https://github.com/pauldijou/redux-act/commit/66a07913fdb36c9206e9bcbd5fa5577d1e6eceb7). You can also run both examples with `npm install && npm start` inside each folder.

- **Why having two syntax to create reducers?** The one with only a map of `action => reduce function` doesn't allow much. This is why the other one is here, in case you would need a small state inside the reducer, having something similar as an actor, or whatever you feel like. Also, one of the syntax is ES6 only.

- **Inside a reducer, why is it `(state, payload)=> newState` rather than `(state, action)=> newState`?** You can find more info about that on the `createReducer` API below, but basically, that's because an action is composed of metadata handled by the lib and your payload. Since you only care about that part, better to have it directly. You can switch back to the full action if necessary of course.

- **Why have you done that? Aren't string constants good enough?** I know that the Redux doc states that such magic isn't really good, that saving a few lines of code isn't worth hiding such logic. I can understand that. And don't get me wrong, the main goal of this lib isn't to reduce boilerplate (even if I like that it does) but to use the actions themselves as keys for the reducers rather than strings which are error prone. You never know what the new dev on your project might do... Maybe (s)he will not realize that the new constant (s)he just introduced was already existing and now everything is broken and a wormhole will appear and it will be the end of mankind. Let's prevent that!

## Advanced usage

```javascript
import { createStore } from 'redux';
import { createAction, createReducer } from 'redux-act';

// When creating action creators, the description is optional
// it will only be used for devtools and logging stuff.
// It's better to put something but feel free to leave it empty if you want to.
const replace = createAction();

// By default, the payload of the action is the first argument
// when you call the action. If you need to support several arguments,
// you can specify a function on how to merge all arguments into
// an unique payload.
const append = createAction('optional description', (...args)=> args.join(''));

// There is another pattern to create reducers
// and it works fine with ES5! (maybe even ES3 \o/)
const stringReducer = createReducer(function (on) {
  on(append, (state, payload)=> state += payload);
  on(replace, (state, payload)=> payload);
  // Warning! If you use the same action twice,
  // the second one will override the previous one.
}, 'missing a lette'); // <-- Default state

// If you only have one global store,
// or want to bind an action to one particular store,
// rather than binding them in each component, you can do it
// once you've created both the store and your actions
const stringStore = createStore(stringReducer);
append.bindTo(stringStore);
replace.bindTo(stringStore);

// Now, when calling actions, they will be automatically dispatched
append('r'); // stringStore.getState() === 'missing a letter'
replace('a'); // stringStore.getState() === 'a'
append('b', 'c', 'd'); // stringStore.getState() === 'abcd'

// If you really need serializable actions, using string constant rather
// than runtime generated id, just use a uppercase description (with eventually some underscores)
// and it will be use as the id of the action
const doSomething = createAction('STRING_CONSTANT');
doSomething(1); // {__id__: 'STRING_CONSTANT', type: 'STRING_CONSTANT', payload: 1}

// Little bonus, if you need to support metadata around your action,
// like needed data but not really part of the payload, you add a second function
const metaAction = createAction('desc', arg => arg, arg => {meta: 'so meta!'});

// Metadata will be the third argument of the reduce function
createReducer({
  [metaAction]: (state, payload, meta)=> payload
});
```

## API

### createAction([description], [payloadReducer], [metaReducer])

#### Parameters

- **description** (string, optional): used by logging and devtools when displaying the action. If this parameter is uppercase only, with underscores, it will used as the id and type of the action rather than the generated id. You can use this feature to have serializable actions you can share between client and server.
- **payloadReducer** (function, optional): transform multiple arguments as a unique payload.
- **metaReducer** (function, optional): transform multiple arguments as a unique metadata object.

#### Usage

Create a new action creator. If you specify a description, it will be used by devtools. By default, `createAction` will return a function and its first argument will be used as the payload when dispatching the action. If you need to support multiple arguments, you need to specify a **payload reducer** in order to merge all arguments into one unique payload.

```javascript
// Super simple action
const simpleAction = createAction();
// Better to add a description
const betterAction = createAction('This is better!');
// Support multiple arguments by merging them
const multipleAction = createAction((text, checked)=> ({text, checked}))
// Again, better to add a description
const bestAction = createAction('Best. Action. Ever.', (text, checked)=> ({text, checked}))
// Serializable action
const serializableAction = createAction('SERIALIZABLE_ACTION');
```

When calling an action creator, the returned object will have the following properties:

- `__id__`: a generated id. Used by the reducers. Don't touch it.
- `type`: totally useless for you, but provide support for devtools.
- `payload`: the data passed when calling the action creator. Will be the first argument of the function except if you specified a payload reducer when creating the action.
- `meta`: if you have provided a **metaReducer**, it will be used to create a metadata object assigned to this key. Otherwise, it's `undefined`.

```javascript
const addTodo = createAction('Add todo');
addTodo('content');
// return { __id__: 1, type: '[1] Add todo', payload: 'content' }

const editTodo = createAction('Edit todo', (id, content)=> ({id, content}));
editTodo(42, 'the answer');
// return { __id__: 2, type: '[2] Edit todo', payload: {id: 42, content: 'the answer'} }

const serializeTodo = createAction('SERIALIZE_TODO');
serializeTodo(1);
// return { __id__: 'SERIALIZE_TODO', type: 'SERIALIZE_TODO', payload: 1 }
```

Remember that you still need to dispatch those actions. If you already have one or more stores, you can bind the action to them so it will be automatically dispatched using the `bindTo` function. Notice that each call to `bindTo` will override any previous call.

```javascript
const action = createAction();
const reducer = createReducer({
  [action]: (state)=> state * 2
});
const store = createStore(reducer, 1);
const store2 = createStore(reducer, -1);

// Automatically dispatch the action to the store when called
action.bindTo(store);
action(); // store.getState() === 2
action(); // store.getState() === 4
action(); // store.getState() === 8

// You can bind the action to several stores using an array
action.bindTo([store, store2]);
action();
// store.getState() === 16
// store2.getState() === -2
```

### createReducer(handlers, [defaultState])

#### Parameters

- **handlers** (object or function): if `object`, a map of action to the reduce function. If `function`, take one attribute which is a function to register actions. See below.
- **defaultState** (anything, optional): the initial state of the reducer. Must not be empty if you plan to use this reducer inside a `combineReducers`.

#### Usage

It's kind of the same syntax as the `Array.prototype.reduce` function. You can specify how to reduce as the first argument and the accumulator, or default state, as the second one. The default state is optional since you can retrieve it from the store when creating it but you should consider always having a default state inside a reducer, especially if you want to use it with `combineReducers` which make such default state mandatory.

There are two patterns to create a reducer. One is passing an object as a map of `action creators` to `reduce functions`. Such functions have the following signature: `(previousState, payload)=> newState`. The other one is using a function factory. Rather than trying to explaining it, just read the following examples.

```javascript
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
```

Since an action is an object with some metadata (`__id__` and `type`) and a `payload` (which is your actual data), all reduce functions directly take the payload as their 2nd argument by default rather than the whole action since all other properties are handled by the lib and you shouldn't care about them anyway. If you really need to use the full action, you can change the behavior of a reducer.

```javascript
const add = createAction();
const sub = createAction();
const reducer = createReducer({
  [add]: (state, action)=> state + action.payload,
  [sub]: (state, action)=> state - action.payload
}, 0);

reducer.options({
  payload: false
});
```

**Pro Tip** You can dynamically add and remove actions. There are two patterns to do so.

```javascript
// Adding and deleting properties from the handlers object
const handlers = {};
const reducer = createReducer(handlers, 0);
const store = createStore(reducer);

const increment = createAction().bindTo(store);
handlers[increment] = (state)=> state + 1;

increment(); // store.getState() === 1
increment(); // store.getState() === 2

delete(handlers[increment]);

increment(); // store.getState() === 2
increment(); // store.getState() === 2

// Using the 'on' and 'off' functions of the reducer
// Those functions will be available whatever pattern
// you used to create the reducer
const reducer = createReducer({}, 0);
const store = createStore(reducer);
const increment = createAction().bindTo(store);

reducer.on(increment, (state)=> state + 1);

increment(); // store.getState() === 1
increment(); // store.getState() === 2

reducer.off(increment);

increment(); // store.getState() === 2
increment(); // store.getState() === 2
```

### bindAll(actionCreators, stores)

#### Parameters

- **actionCreators** (object or array): which action creator(s) to bind. Can be only one or several inside an array.
- **stores** (object or array): the target store(s) when dispatching actions. Can be only one or several inside an array.

#### Usage

A common pattern is to export a set of action creators as an object. If you want to bind all of them to a store, there is this super small helper. You can also use an array of action creators. And since you can bind to one or several stores, you can specify either one store or an array of stores.

```javascript
// actions.js
export const add = createAction('Add');
export const sub = createAction('Sub');

// reducer.js
import * as actions from './actions';
export default createReducer({
  [actions.add]: (state, payload)=> state + payload,
  [actions.sub]: (state, payload)=> state - payload
}, 0);

// store.js
import * as actions from './actions';
import reducer from './reducer';

const store = createStore(reducer);
bindAll(actions, store);

export default store;
```

## Cookbook

### Async actions

```javascript
import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {createAction, createReducer} from '../src/index';

const start = createAction();
const success = createAction();

const reducer = createReducer({
  [start]: (state)=> ({ ...state, running: true }),
  [success]: (state, result)=> ({ running: false, result })
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
      setTimeout(()=>
        resolve(1)
      , 5);
    }).then(result=>
      dispatch(success(result))
      // state: { running: false, result: 1 }
    );
  };
}

store.dispatch(fetch()).then(()=> {
  // state: { running: false, result: 1 }
});

// 2) You can enjoy the redux-act binding
// and directly call the actions
start.bindTo(store);
success.bindTo(store);

const store = createStore(reducer);

function fetch() {
  // state: { running: false, result: false }
  start();
  // state: { running: true, result: false }
  return new Promise(resolve => {
    // Here, you should probably do a real async call,
    // like, you know, XMLHttpRequest or Global.fetch stuff
    setTimeout(()=>
      resolve(1)
    , 5);
  }).then(result=>
    success(result)
    // state: { running: false, result: 1 }
  );
}

fetch().then(()=> {
  // state: { running: false, result: 1 }
});
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
