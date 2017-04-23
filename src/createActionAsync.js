import createAction from './createAction'

export default function createActionAsync(description, api, options = {}) {

  let actions = {
    request: createAction(`${description}_REQUEST`, options.payloadReducer, options.metaReducer),
    ok: createAction(`${description}_OK`, options.payloadReducer, options.metaReducer),
    error: createAction(`${description}_ERROR`, options.payloadReducer, options.metaReducer)
  }

  let actionAsync = (payload) => {
    return (dispatch) => {
      dispatch(actions.request(payload));
      return api(payload)
      .then(res => {
        dispatch(actions.ok(res))
      })
      .catch(err => {
        dispatch(actions.error(err))
        throw err;
      })
    }
  }

  actionAsync.request = actions.request;
  actionAsync.ok = actions.ok;
  actionAsync.error = actions.error;
  return actionAsync;

};
