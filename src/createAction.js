import { ID } from './constants';

let id = 0;

const identity = arg => arg;

export default function createAction(name, payloadCreator = identity, metaCreator) {
  if (typeof name === 'function') {
    metaCreator = payloadCreator;
    payloadCreator = name;
    name = undefined;
  }

  if (typeof payloadCreator !== 'function') {
    payloadCreator = identity;
  }

  const action = {
    id: ++id,
    type: `[${id}]${name ? ' ' + name : ''}`
  };

  let actionStores = undefined;

  function setupPayload(args) {
    const result = {
      [ID]: action.id,
      type: action.type,
      payload: payloadCreator(...args)
    };
    if (typeof metaCreator === 'function') {
      result.meta = metaCreator(...args);
    }
    return result;
  }

  function actionCreator(...args) {
    const payloaded = setupPayload(args);

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
