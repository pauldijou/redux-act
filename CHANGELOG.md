# 1.8.0

- Correctly support ESM build. (thanks @AndyOGo and @LucaMele)

# 1.7.9

- Rollback previous release.

# 1.7.8

- Add ability to natively import es6 modules. (thanks @Ptico)

# 1.7.7

- Improve TS types around `on` function for reducers. (thanks @Tenga)

# 1.7.6

- Improve TS types around meta reducer. (thanks @megawac)

# 1.7.5

- Improve README. (thanks @samiskin)
- TypeScript support for Redux 4. (thanks @AbraaoAlves)

# 1.7.4

- Add `asError` typings. (thanks @mdwagner)

# 1.7.3

- Improve `reducer.on` typing. (thanks @AlexGalays)

# 1.7.2

- Use TS types from Redux. (thanks @AlexGalays)

# 1.7.1

- Add missing TS types. (thanks @ZachStoltz)

# 1.7.0

- Prevent error during reduce if wrong action. (thanks @antonkri97)

# 1.6.0

- Add `fallback` option to handle any non-supported action inside a reducer.
- Ignore any action which type starts with "@@redux/". This can be a **breaking change** but should not be since you should never handle those actions.

# 1.5.1

- Add missing TS types. (thanks @comerc)

# 1.5.0

- Add `error` property to support FSA. (thanks @gotrecillo)

# 1.4.1

- Improve TS types for action creators with payload function up to 6 arguments (thanks @ej9x)

# 1.4.0

- `on` and `off` reducer functions now support arrays of action creators.
- `on` and `off` reducer functions now return the reducer itself so you can chain them.
- `options` now also return the reducer.

# 1.3.2

- Improve TS typings and doc (thanks @psachs21)

# 1.3.1

- Improve TS typings (thanks @psachs21)
- Upgrade dependencies and fix tests

# 1.3.0

Add `enableChecking` and `disableChecking` on `types` to support HMR.

# 1.2.0

Add `transform-object-assign` babel plugin to support old browsers without `Object.assign`.

# 1.1.0

Support numbers in serializable actions.

# 1.0.0

After months without any change, time to move to 1.0.0. Removing deprecated `binded` function in favor of the `bound` one.

# 0.5.0

Remove `meta` key from action if no meta-reducer provided.

# 0.4.2

Add browserify in order to compile a standalone file.

# 0.4.1

Add [types API](https://github.com/pauldijou/redux-act#types) to help testing.

# 0.4.0

So, it wasn't the last release before 1.0 after all...

## :warning: Breaking changes

They shouldn't actually break your app because they are well hidden but I need to mention them. Before, the generated id was placed in both a "private" property `__id__` and the `type` property (with the optional description appended to it). I did that to maximize safety when checking the id and to boost performance because comparing numbers is blazing fast.

After a lot of thoughts, it wasn't worth it. It's blocking compatibility with other Redux libs and do not rely on the type anymore like it should regarding Redux document. So in this release, `redux-act` is dropping the `__id__` property and will only rely on the `type`. Since the id is still put in there, it will not clash, not even with non-redux-act actions (except if you have crazy types like `const TYPE = '[42] Whatever, yolo'`). See [the compatibility section](https://github.com/pauldijou/redux-act#compatibility) for more infos.

## Fix typo

Because I'm not that good in English, I wrote `binded` instead of `bound` (thanks [@appsforartists](https://github.com/appsforartists)). The method has been renamed. The wrong one will be deprecated with a warning and removed in the 1.0.

## Loggers

I started working a better logger support for `redux-act` actions, especially batch actions. Check [the loggers section](https://github.com/pauldijou/redux-act#loggers) for more infos. Only Redux Logger is supported right now, but you can open an issue or submit a pull request to ask for any other logger.

# 0.3.0

This is probably the last release before 1.0. Just want to battle test it in production before freezing the API.

## :warning: Breaking changes (sorry...)

`bindTo` has been renamed to `assignTo`. There is still a `bindTo` function, but now, it returns a new action creator rather than mutating the existing one. This is in order to both be closer to the actual `bind` function (which return a new function) and offer better support for immutability and server side code (where you have common actions for all requests but a store for each one, so mutating isn't an option). Just do a global find and replace of `bindTo` to `assignTo` and `bindAll` to `assignAll` and you are good to go!

## assignTo and assignAll

Those functions replace `bindTo` and `bindAll`. Same feature.

## bindTo and bindAll

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

`batch` is an action creator like any other created using `createAction`. You can assign or bind it if you want, especially if you only have one store. You can even use inside reducers. It is enabled by default, but you can remove it and put it back. See README for more examples.

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
dispatch(batch(a1(), a2(), a3()));
// -> trigger all store listeners only once

// You can also use an array if you want
dispatch(batch([a1(), a2(), a3()]));
```

:warning: **Warning** This does not work with binded or assigned action creators. They need to return an action object, not automatically dispatch it. If you are using those features (because, you know, they are awesome), you can call the `raw` method to retrieve the action object directly without dispatching it.

```javascript
// Assigned action creators
const a1 = createAction();
const a2 = createAction();
a1.assignTo(store);
a2.assignTo(store);
store.dispatch(batch(a1.raw(), a2.raw()));

// Binded action creators
const a1 = createAction().bindTo(store);
const a2 = createAction().bindTo(store);
store.dispatch(batch(a1.raw(), a2.raw()));
```

You can do some other funny stuff, just because.

```javascript
import { batch, disbatch, createAction } from 'redux-act';
import store from './store';

const a1 = createAction();
const a2 = createAction();

// All the following samples do the exact same thing.
// (and each time, you have both syntax, using or not an array)

// Basic batch
store.dispatch(batch(a1(), a2()));
store.dispatch(batch([a1(), a2()]));

// Disbatch from a store
disbatch(store, a1(), a2());
disbatch(store, [a1(), a2()]);

// Disbatch from a dispatch function
disbatch(store.dispatch, a1(), a2());
disbatch(store.dispatch, [a1(), a2()]);

// Add the disbatch method to the store and use it
disbatch(store);
store.disbatch(a1(), a2());
store.disbatch([a1(), a2()]);
```

## Action creator status

You can now test the status of an action creator.

```javascript
const action = createAction();
const store = createStore(() => 0);

action.assigned(); // false, not assigned
action.binded(); // false, not binded
action.dispatched(); // false, test if either assigned or binded

action.assignTo(store);
action.assigned(); // true
action.binded(); // false
action.dispatched(); // true

const bindedAction = action.bindTo(store);
bindedAction.assigned(); // false
bindedAction.binded(); // true
bindedAction.dispatched(); // true
```

# 0.2.0

## Metadata

You can now have some metadata. It's just as the payload, you need a function to reduce the arguments as a metadata object and it will be the third argument inside the reducer.

```javascript
const doStuff = createAction(
  'do some stuff',
  arg => arg,
  (one, two) => {
    so: 'meta';
  }
);
const reducer = createReducer({
  [doStuff]: (state, payload, meta) => payload
});
```

## Serializable actions

Sometimes, you need to share actions between client and server, or between clients. You can no longer rely on id generated at runtime, you need to use strict manually provided constants. That's not the main goal of the lib, but if you really need it, just use a fully uppercase description and it will be use as the id.

```javascript
const serializedDoStuff = createAction(
  'DO_STUFF',
  arg => arg,
  (one, two) => {
    so: 'meta';
  }
);
```

# 0.1.1

Use a more private id key for better support of non redux-act actions.

# 0.1.0

And we are live !
