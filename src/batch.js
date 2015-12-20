import createAction from './createAction';

export default createAction('Batch', (...actions) => {
  if (actions && actions.length === 1 && Array.isArray(actions[0])) {
    return actions[0];
  }
  return (actions || []);
});
