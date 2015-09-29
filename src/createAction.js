import { ID } from './constants';

let id = 0;

const identity = arg => arg;

const undef = () => undefined;

export default function createAction(name, payloadReducer, metaReducer) {
  if (typeof name === 'function') {
    metaReducer = payloadReducer;
    payloadReducer = name;
    name = undefined;
  }

  if (typeof payloadReducer !== 'function') {
    payloadReducer = identity;
  }

  if (typeof metaReducer !== 'function') {
    metaReducer = undef;
  }

  const action = {
    id: ++id,
    type: `[${id}]${name ? ' ' + name : ''}`
  };

  let actionStores = undefined;

  function actionCreator(...args) {
    const payloaded = {
      [ID]: action.id,
      type: action.type,
      payload: payloadReducer(...args),
      meta: metaReducer(...args)
    };

    if (Array.isArray(actionStores)) {
      return actionStores.map(store=> store.dispatch(payloaded));
    } else if (actionStores) {
      return actionStores.dispatch(payloaded);
    } else {
      return payloaded;
    }
  }

  actionCreator.toString = ()=> action.id;

  actionCreator.bindTo = (stores)=> {
    actionStores = stores;
    return actionCreator;
  };

  return actionCreator;
};
