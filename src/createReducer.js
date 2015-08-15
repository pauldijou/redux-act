export default function createReducer(handlers = {}, defaultState) {
  function on(actionCreator, handler) {
    handlers[actionCreator.toString()] = handler;
  }

  function off(actionCreator) {
    delete handlers[actionCreator.toString()];
  }

  if (typeof handlers === 'function') {
    const factory = handlers;
    handlers = {};
    factory(on);
  }

  function reduce(state = defaultState, action) {
    if (handlers[action.id]) {
      return handlers[action.id](state, action);
    } else {
      return state;
    }
  };

  reduce.on = on;
  reduce.off = off;

  return reduce;
};
