import { createReducer } from 'redux-act';
import * as actions from '../actions/TodoActions';

const initialState = [{
  text: 'Use Redux',
  marked: false,
  id: 0
}];

export default createReducer({
  [actions.addTodo]: (state, text)=> [{
    id: (state.length === 0) ? 0 : state[0].id + 1,
    marked: false,
    text: text
  }, ...state],

  [actions.deleteTodo]: (state, id)=> state.filter(todo=> todo.id !== id),

  [actions.editTodo]: (state, todo)=> state.map(t=> todo.id === t.id ? {...t, text: todo.text} : t),

  [actions.markTodo]: (state, id)=> state.map(todo=> todo.id === id ? {...todo, marked: !todo.marked} : todo),

  [actions.markAll]: (state)=> {
    const areAllMarked = state.every(todo => todo.marked);
    return state.map(todo => ({
      ...todo,
      marked: !areAllMarked
    }));
  },

  [actions.clearMarked]: (state)=> state.filter(todo => todo.marked === false)
}, initialState);
