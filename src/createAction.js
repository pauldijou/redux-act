
let id = 0;
let types = {};

const identity = arg => arg;

export default function createAction(name, mapper = identity) {
  if (typeof name === 'function') {
    mapper = name;
    name = undefined;
  }

  if (typeof mapper !== 'function') {
    mapper = identity;
  }

  if (name == null) {
    name = (++id).toString();
  }

  if (types.hasOwnProperty(name)) {
    throw new Error('Duplicate action type: ' + name);
  }

  types[name] = null;

  const action = {
    type: name
  };

  let actionStores = undefined;

  function setupPayload(payload) {
    return {
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

  actionCreator.toString = ()=> action.type;

  actionCreator.bindTo = (stores)=> {
    actionStores = stores;
    return actionCreator;
  };

  return actionCreator;
};
