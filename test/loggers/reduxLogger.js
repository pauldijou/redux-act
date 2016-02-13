import chai from 'chai';
import spies from 'chai-spies';
import {createStore, applyMiddleware} from 'redux';
import createLogger from 'redux-logger';
import {createAction, batch, loggers} from '../../src/index';
chai.use(spies);
const expect = chai.expect;
const spy = chai.spy.on(console, 'log');

describe('loggers > redux logger', function () {
  it('should log actions', function () {
    const reducer = function () {};
    const logger = createLogger({ logger: console });
    const store = applyMiddleware(logger)(createStore)(reducer);
    const improvedLogger = createLogger({ ...loggers.reduxLogger });
    const improvedStore = applyMiddleware(improvedLogger)(createStore)(reducer);
    const action1 = createAction();
    const action2 = createAction();

    // Normal logger
    expect(spy).to.have.been.called.exactly(0);

    const a1 = action1(10);
    store.dispatch(a1);
    expect(spy).to.have.been.called.with(a1);

    const a21 = action1(11);
    const a22 = action2(true);
    const a23 = action1('foo');
    const a24 = batch([a21, a22, a23]);
    store.dispatch(a24);
    expect(spy).to.have.been.called.with(a24);
    expect(spy).not.to.have.been.called.with(a21);
    expect(spy).not.to.have.been.called.with(a22);
    expect(spy).not.to.have.been.called.with(a23);

    // Improved logger
    spy.reset();

    expect(spy).to.have.been.called.exactly(0);

    const a3 = action1(20);
    improvedStore.dispatch(a3);
    expect(spy).to.have.been.called.with(a3);

    const a41 = action1(30);
    const a42 = action2(false);
    const a43 = action1('bar');
    improvedStore.dispatch(batch([a41, a42, a43]));
    expect(spy).to.have.been.called.with(a41);
    expect(spy).to.have.been.called.with(a42);
    expect(spy).to.have.been.called.with(a43);
  });
});
