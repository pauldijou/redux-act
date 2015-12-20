export default function bindAll(actions, stores) {
  if (Array.isArray(actions)) {
    return actions.map(action => action.bindTo(stores));
  } else {
    return Object.keys(actions).reduce((binds, action) => {
      binds[action] = actions[action].bindTo(stores);
      return binds;
    }, {});
  }
};
