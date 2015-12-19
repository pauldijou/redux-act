import React, { Component } from 'react';
import TodoApp from './TodoApp';
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';
import { Provider } from 'react-redux';
import { assignAll } from 'redux-act';
import configureStore from '../store/configureStore';
import * as todoActions from '../actions/TodoActions';

const store = configureStore();

// Just to demonstrate it, we will auto-bind all actions
// to the unique store but feel free to bind them inside
// the components if you prefer so
assignAll(todoActions, store);

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
