import { createAction, createReducer } from 'redux-act';

const initialState = [
  {
    text: 'Use Redux',
    completed: false,
    id: 0
  }
]

export const addTodo = createAction('add todo');
export const deleteTodo = createAction('delete todo');
export const editTodo = createAction('edit todo', (id, text) => ({ id, text }));
export const completeTodo = createAction('complete todo');
export const completeAll = createAction('complete all');
export const clearCompleted = createAction('clear completed');

export default createReducer({
  [addTodo]: (state, text) => [
    {
      id: state.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
      completed: false,
      text: text
    },
    ...state
  ],

  [deleteTodo]: (state, id) => state.filter(todo =>
    todo.id !== id
  ),

  [editTodo]: (state, { id, text }) => state.map(todo =>
    todo.id === id ?
      Object.assign({}, todo, { text }) :
      todo
  ),

  [completeTodo]: (state, id) => state.map(todo =>
    todo.id === id ?
      Object.assign({}, todo, { completed: !todo.completed }) :
      todo
  ),

  [completeAll]: (state) => {
    const areAllMarked = state.every(todo => todo.completed)
    return state.map(todo => Object.assign({}, todo, {
      completed: !areAllMarked
    }))
  },

  [clearCompleted]: (state) => state.filter(todo => todo.completed === false)
}, initialState);
