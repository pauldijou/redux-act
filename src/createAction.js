import { add, check } from './types';

let id = 0;

const identity = (arg) => arg;

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
    metaReducer = undefined;
  }

  const isSerializable = (typeof description === 'string') && /^[0-9A-Z_]+$/.test(description);

  if (isSerializable) {
    check(description);
    add(description);
  } else {
    ++id;
  }

  const type = isSerializable ? description : `[${id}]${description ? ' ' + description : ''}`

  let dispatchFunctions = undefined;

  function makeAction(...args) {
    const payload = payloadReducer(...args)

    if (metaReducer) {
      return {
        type,
        payload: payload,
        error: payload instanceof Error,
        meta: metaReducer(...args),
      };
    }

    return {
      type,
      payload: payload,
      error: payload instanceof Error,
    };
  }

  const makeAndDispatch = (dispatchs, isError) => (...args) => {
    const payloadedAction = makeAction(...args);
    if (!payloadedAction.error) {
      payloadedAction.error = isError
    }

    if (Array.isArray(dispatchs)) {
      return dispatchs.map(dispatch => dispatch(payloadedAction));
    } else if (dispatchs) {
      return dispatchs(payloadedAction);
    } else {
      return payloadedAction;
    }
  }

  function actionCreator(...args) {
    return makeAndDispatch(dispatchFunctions, false)(...args);
  }

  actionCreator.asError = (...args) => {
    return makeAndDispatch(dispatchFunctions, true)(...args);
  }

  actionCreator.getType = () => type;
  actionCreator.toString = () => type;

  actionCreator.raw = makeAction;

  actionCreator.assignTo = (dispatchOrStores) => {
    dispatchFunctions = normalizeAll(dispatchOrStores);
    return actionCreator;
  };

  actionCreator.assigned = () => !!dispatchFunctions;
  actionCreator.bound = () => false;
  actionCreator.dispatched = actionCreator.assigned;

  actionCreator.bindTo = (dispatchOrStores) => {
    const boundActionCreator = makeAndDispatch(normalizeAll(dispatchOrStores, false));
    boundActionCreator.asError = makeAndDispatch(normalizeAll(dispatchOrStores, true));
    boundActionCreator.raw = makeAction;
    boundActionCreator.getType = actionCreator.getType;
    boundActionCreator.toString = actionCreator.toString;
    boundActionCreator.assignTo = () => boundActionCreator;
    boundActionCreator.bindTo = () => boundActionCreator;
    boundActionCreator.assigned = () => false;
    boundActionCreator.bound = () => true;
    boundActionCreator.dispatched = boundActionCreator.bound;
    return boundActionCreator;
  };

  return actionCreator;
};
