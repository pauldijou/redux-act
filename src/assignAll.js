export default function assignAll(actions, stores) {
  if (Array.isArray(actions)) {
    return actions.map(action => action.assignTo(stores));
  } else {
    return Object.keys(actions).reduce((assigns, action) => {
      assigns[action] = actions[action].assignTo(stores);
      return assigns;
    }, {});
  }
};
