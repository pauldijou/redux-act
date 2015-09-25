import { ID } from './constants';

export default function createReducer(handlers = {}, defaultState) {
  let opts = {
    payload: true
  };

  function on(actionCreator, handler) {
    handlers[actionCreator.toString()] = handler;
  }

  function off(actionCreator) {
    delete handlers[actionCreator.toString()];
  }

  function options(newOpts) {
    Object.keys(newOpts).forEach(name => opts[name] = newOpts[name])
  }

  if (typeof handlers === 'function') {
    const factory = handlers;
    handlers = {};
    factory(on);
  }

  function reduce(state = defaultState, action) {
    if (action[ID] && handlers[action[ID]]) {
      if (opts.payload) {
        return handlers[action[ID]](state, action.payload, action.meta);
      } else {
        return handlers[action[ID]](state, action);
      }
    } else {
      return state;
    }
  };

  reduce.on = on;
  reduce.off = off;
  reduce.options = options;

  return reduce;
};
