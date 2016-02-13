import { createStore, compose, applyMiddleware } from 'redux';
import { devTools, persistState } from 'redux-devtools';
import createLogger from 'redux-logger';
import { loggers } from 'redux-act';
import rootReducer from '../reducers';

export default function configureStore(initialState) {
  const logger = createLogger({
    ...loggers.reduxLogger,
  });

  const composedCreateStore = compose(
    devTools(),
    persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
  )(createStore);

  const createStoreWithMiddleware = applyMiddleware(logger)(composedCreateStore);

  const store = createStoreWithMiddleware(rootReducer, initialState);

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers');
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
