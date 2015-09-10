import React, { Component } from 'react';
import CounterApp from './CounterApp';
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';
import { Provider } from 'react-redux';
import configureStore from '../store/configureStore';

const store = configureStore();

export default class App extends Component {
  render() {
    return (
      <div>
        <Provider store={store}>
          {() => <CounterApp />}
        </Provider>
        <DebugPanel top right bottom>
          <DevTools store={store}
                    monitor={LogMonitor} />
        </DebugPanel>
      </div>
    );
  }
}
