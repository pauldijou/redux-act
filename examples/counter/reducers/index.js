import { createAction, createReducer } from 'redux-act';

export const increment = createAction('increment');
export const decrement = createAction('decrement');

export default createReducer({
  [increment]: (state) => state + 1,
  [decrement]: (state) => state - 1
}, 0);
