export default function bindAll(actions, stores) {
  if (Array.isArray(actions)) {
    return actions.map(action=> action.bindTo(stores));
  } else {
    Object.keys(actions).forEach(key=> actions[key].bindTo(stores));
    return actions;
  }
};
