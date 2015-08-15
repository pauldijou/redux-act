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

  function actionCreator(...args) {
    const payload = mapper.apply(undefined, args);

    if (Array.isArray(actionStores)) {
      return actionStores.map(store=> store.dispatch({...action, payload}));
    } else if (actionStores && actionStores.dispatch) {
      return actionStores.dispatch({...action, payload});
    } else {
      return {...action, payload};
    }
  }

  actionCreator.toString = ()=> action.id;

  actionCreator.bindTo = (stores)=> {
    actionStores = stores;
    return actionCreator;
  };

  return actionCreator;
}
