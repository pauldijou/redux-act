import batch from './batch';

function normalizeType(typeOrActionCreator) {
  if (typeOrActionCreator && typeOrActionCreator.getType) {
    return typeOrActionCreator.toString();
  }
  return typeOrActionCreator;
}

export default function createReducer(handlers = {}, defaultState) {
  const opts = {
    payload: true
  };

  const reducer = Object.assign(reduce, {
    has, on, off, options
  })

  function has(typeOrActionCreator) {
    return !!handlers[normalizeType(typeOrActionCreator)];
  }

  function on(typeOrActionCreator, handler) {
    if (!handler) {
      handler = (state, payload) => payload;
    }
    if (Array.isArray(typeOrActionCreator)) {
      typeOrActionCreator.forEach(function (action) {
        on(action, handler)
      })
    } else {
      handlers[normalizeType(typeOrActionCreator)] = handler;
    }

    return reducer;
  }

  function off(typeOrActionCreator) {
    if (Array.isArray(typeOrActionCreator)) {
      typeOrActionCreator.forEach(off)
    } else {
      delete handlers[normalizeType(typeOrActionCreator)];
    }
    return reducer;
  }

  function options(newOpts) {
    Object.keys(newOpts).forEach(name => opts[name] = newOpts[name])
    return reducer;
  }

  if (typeof handlers === 'function') {
    const factory = handlers;
    handlers = {};
    factory(on, off);
  }

  if (!has(batch)) {
    on(batch, (state, payload) => {
      if (opts.payload) {
        return payload.reduce(reduce, state);
      } else {
        return payload.payload.reduce(reduce, state);
      }
    });
  }

  function reduce(state = defaultState, action) {
    if (action && handlers[action.type]) {
      if (opts.payload) {
        return handlers[action.type](state, action.payload, action.meta);
      } else {
        return handlers[action.type](state, action);
      }
    } else {
      return state;
    }
  }

  return reducer;
};
