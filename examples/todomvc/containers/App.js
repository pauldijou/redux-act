import React, { Component } from 'react';
import TodoApp from './TodoApp';
import { createStore, combineReducers, compose } from 'redux';
import { devTools, persistState } from 'redux-devtools';
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';
import { Provider } from 'react-redux';
import { bindAll } from 'redux-act';
import * as reducers from '../reducers';
import * as todoActions from '../actions/TodoActions';

const finalCreateStore = compose(
  devTools(),
  persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)),
  createStore
);

const reducer = combineReducers(reducers);
const store = finalCreateStore(reducer);

// Just to demonstrate it, we will auto-bind all actions
// to the unique store but feel free to bind them inside
// the components if you prefer so
bindAll(todoActions, store);

export default class App extends Component {
  render() {
    return (
      <div>
        <Provider store={store}>
          {() => <TodoApp /> }
        </Provider>
        <DebugPanel top right bottom>
          <DevTools store={store}
                    monitor={LogMonitor} />
        </DebugPanel>
      </div>
    );
  }
}
