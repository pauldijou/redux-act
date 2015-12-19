# 0.3.0

## :warning: Breacking changes (sorry...)

`bindTo` has been renamed to `assignTo`. There is still a `bindTo` function, but now, it returns a new action creator rather than mutating the existing one. This is in order to both be closer to the actual `bind` function (which return a new function) and offer better support for immutability and server side code (where you have common actions for all requests but a store for each one, so mutating isn't an option). Just do a global find and replace of `bindTo` to `assignTo` and `bindAll` to `assignAll` and you are good to go!

## assignTo and assignAll

Those functions replace `bindTo` and `bindAll`. Same feature.

## bindTo

Now returns a new action creator which will act just like the original one but no longer mutate it.

## dispatch function or store object

When passing a store to `bindTo`, `assignTo`, `bindAll` or `assignAll`, you can now also pass a dispatch function. This might come handy if you want to do the binding inside an `connect` function from `react-redux` where you only have access to the dispatch function.

```javascript
import store from './store';

// This code...
const bindedAction = createAction().bindTo(store);
// Is equal to
const bindedAction = creatAction().bindTo(store.dispatch);
```

## batch

`redux-act` now supports batched actions. You should know that each dispatched action will trigger all listeners on the store. Some libs rely on that, `react-redux` might re-render it's wrapped React component for example. So if you need to dispatch several actions at once to update different parts of your store, rather than creating a meta-action that do all the stuff inside the reducer, you can batch them so they will all be applied inside only one dispatch.

```javascript
import { dispatch } from './store';

const a1 = createAction();
const a2 = createAction();
const a3 = createAction();

// -- Default strategy
dispatch(a1());
// -> trigger all store listeners
dispatch(a2());
// -> trigger all store listeners
dispatch(a3());
// -> trigger all store listeners

// -- Batched strategy
import { batch } from 'redux-act';
dispatch(batch([a1(), a2(), a3()]));
// -> trigger all store listeners only once
```

:warning: **Warning** This does not work with binded or assigned action creators. They need to return an action object, not automatically dispatch it. If you are using those features (because, you know, they are awesome), you can call the `???` method to retrieve the action object directly without dispatching it.

```javascript
// Assigned action creators
const a1 = createAction();
const a2 = createAction();
a1.assignTo(store);
a2.assignTo(store);
store.dispatch(batch([a1.???(), a2.???()]));

// Binded action creators
const a1 = createAction().bindTo(store);
const a2 = createAction().bindTo(store);
store.dispatch(batch([a1.???(), a2.???()]));
```

You can do some other funny stuff, just because.

```javascript
import { batch, disbatch, createAction } from 'redux-act';
import store from './store';

const a1 = createAction();
const a2 = createAction();

// All the following samples do the exact same thing.

// Basic batch
store.dispatch(batch([a1(), a2()]));

// Disbatch from a store
disbatch(store, [a1(), a2()]);

// Disbatch from a dispatch function
disbatch(store.dispatch, [a1(), a2()]);

// Add the disbatch method to the store and use it
disbatch(store);
store.disbatch([a1(), a2()]);
```

# 0.2.0

## Metadata

You can now have some metadata. It's just as the payload, you need a function to reduce the arguments as a metadata object and it will be the third argument inside the reducer.

```javascript
const doStuff = createAction('do some stuff', arg => arg, (one, two)=> {so: 'meta'});
const reducer = createReducer({
  [doStuff]: (state, payload, meta)=> payload
});
```

## Serializable actions

Sometimes, you need to share actions between client and server, or between clients. You can no longer rely on id generated at runtime, you need to use strict manually provided constants. That's not the main goal of the lib, but if you really need it, just use a fully uppercase description and it will be use as the id.

```javascript
const serializedDoStuff = createAction('DO_STUFF', arg => arg, (one, two)=> {so: 'meta'});
```

# 0.1.1

Use a more private id key for better support of non redux-act actions.

# 0.1.0

And we are live !
