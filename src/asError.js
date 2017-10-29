export default function asError(action) {
  if (typeof action === 'object' && action !== null) {
    action.error = true
  }
  return action
};
