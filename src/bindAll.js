export default function bindAll(actions, stores) {
  if (Array.isArray(actions)) {
    return actions.map(action => action.bindTo(stores));
  }
  return Object.keys(actions).reduce((binds, action) => {
    return Object.assign(binds, {
      [action]: actions[action].bindTo(stores)
    });
  }, {});
};
