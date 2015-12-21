import { ID } from './constants';

let id = 0;

const types = {}

const identity = (arg) => arg;

const undef = () => undefined;

const normalize = (dispatchOrStore) => {
  if (dispatchOrStore && typeof dispatchOrStore.dispatch === 'function') {
    return dispatchOrStore.dispatch;
  } else {
    return dispatchOrStore;
  }
}

const normalizeAll = (dispatchOrStores) => {
  if (Array.isArray(dispatchOrStores)) {
    return dispatchOrStores.map(normalize);
  } else {
    return normalize(dispatchOrStores);
  }
}

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

  let dispatchFunctions = undefined;

  function makeAction(...args) {
    return {
      [ID]: action.id,
      type: action.type,
      payload: payloadReducer(...args),
      meta: metaReducer(...args)
    };
  }

  const makeAndDispatch = (dispatchs) => (...args) => {
    if (Array.isArray(dispatchs)) {
      const payloadedAction = makeAction(...args);
      return dispatchs.map(dispatch => dispatch(payloadedAction));
    } else if (dispatchs) {
      return dispatchs(makeAction(...args));
    } else {
      return makeAction(...args);
    }
  }

  function actionCreator(...args) {
    return makeAndDispatch(dispatchFunctions)(...args);
  }

  actionCreator.toString = () => action.id;

  actionCreator.raw = makeAction;

  actionCreator.assignTo = (dispatchOrStores)=> {
    dispatchFunctions = normalizeAll(dispatchOrStores);
    return actionCreator;
  };

  actionCreator.assigned = () => !!dispatchFunctions;
  actionCreator.binded = () => false;
  actionCreator.dispatched = actionCreator.assigned;

  actionCreator.bindTo = (dispatchOrStores) => {
    const bindedActionCreator = makeAndDispatch(normalizeAll(dispatchOrStores));
    bindedActionCreator.raw = makeAction;
    bindedActionCreator.toString = actionCreator.toString;
    bindedActionCreator.assignTo = () => bindedActionCreator;
    bindedActionCreator.bindTo = () => bindedActionCreator;
    bindedActionCreator.assigned = () => false;
    bindedActionCreator.binded = () => true;
    bindedActionCreator.dispatched = bindedActionCreator.binded;
    return bindedActionCreator;
  };

  return actionCreator;
};
