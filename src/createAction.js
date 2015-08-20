import { ID } from './constants';

let id = 0;

const identity = arg => arg;

export default function createAction(name, mapper = identity) {
  if (typeof name === 'function') {
    mapper = name;
    name = undefined;
  }

  if (typeof mapper !== 'function') {
    mapper = identity;
  }

  const action = {
    id: ++id,
    type: `[${id}]${name ? ' ' + name : ''}`
  };

  let actionStores = undefined;

  function setupPayload(payload) {
    return {
      [ID]: action.id,
      type: action.type,
      payload: payload
    };
  }

  function actionCreator(...args) {
    const payloaded = setupPayload(mapper.apply(undefined, args));

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
