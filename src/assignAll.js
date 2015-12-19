export default function assignAll(actions, stores) {
  if (Array.isArray(actions)) {
    return actions.map(action=> action.assignTo(stores));
  } else {
    return Object.keys(actions).reduce((binds, action) => {
      binds[action] = actions[action].assignTo(stores);
      return binds;
    }, {});
  }
};
