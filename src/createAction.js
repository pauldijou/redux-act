import { ID } from './constants';

let id = 0;

const types = {}

const identity = arg => arg;

const undef = () => undefined;

export default function createAction(description, payloadReducer, metaReducer) {
  if (typeof description === 'function') {
    metaReducer = payloadReducer;
    payloadReducer = description;
    description = undefined;
  }

  if (typeof payloadReducer !== 'function') {
    payloadReducer = identity;
  }

  if (typeof metaReducer !== 'function') {
    metaReducer = undef;
  }

  const isSerializable = (typeof description === 'string') && /^[A-Z_]+$/.test(description);

  if (isSerializable) {
    if (types[description]) {
      throw new TypeError(`Duplicate action type: ${description}`);
    }

    types[description] = true;
  }

  const action = {
    id: isSerializable ? description : ++id,
    type: isSerializable ? description : `[${id}]${description ? ' ' + description : ''}`
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
