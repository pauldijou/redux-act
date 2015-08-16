import { createAction } from 'redux-act';

export const addTodo = createAction('Add new todo');
export const deleteTodo = createAction('Delete todo');
export const editTodo = createAction('Edit todo', (id, text)=> ({id, text}));
export const markTodo = createAction('Mark todo');
export const markAll = createAction('Mark all todos');
export const clearMarked = createAction('Clear all marked todos');
