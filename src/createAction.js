import { ID } from './constants';

let id = 0;

const identity = arg => arg;

const undef = () => undefined;

export default function createAction(name, payloadCreator = identity, metaCreator) {
  if (typeof name === 'function') {
    metaCreator = payloadCreator;
    payloadCreator = name;
    name = undefined;
  }

  if (typeof payloadCreator !== 'function') {
    payloadCreator = identity;
  }

  if (typeof metaCreator !== 'function') {
    metaCreator = undef;
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
      payload: payloadCreator(...args),
      meta: metaCreator(...args)
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
