export default function assignAll(actions, stores) {
  if (Array.isArray(actions)) {
    return actions.map(action => action.assignTo(stores));
  }
  return Object.keys(actions).reduce((assigns, action) => {
    return Object.assign(assigns, {
      [action]: actions[action].assignTo(stores)
    });
  }, {});
};
