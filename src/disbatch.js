import batch from './batch';

export default function disbatch(store, ...actions) {
  if (actions && actions.length > 0) {
    if (!store || (typeof store !== 'function' && typeof store.dispatch !== 'function')) {
      throw new TypeError('disbatch must take either a valid Redux store or a dispatch function as first parameter');
    }

    if (typeof store.dispatch === 'function') {
      store = store.dispatch;
    }

    // store is actually the dispatch function here
    return store(batch(...actions));
  } else {
    if (!store || typeof store.dispatch !== 'function') {
      throw new TypeError('disbatch must take a valid Redux store with a dispatch function as first parameter');
    }

    return Object.assign(store, {
      disbatch: disbatch.bind(undefined, store)
    });
  }
}
