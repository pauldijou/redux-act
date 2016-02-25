import chai, {assert} from 'chai';
import spies from 'chai-spies';
import thunk from 'redux-thunk'
import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {createActionAsync, createReducer} from '../src/index';
const expect = chai.expect;
chai.use(spies);

describe.only('createActionAsync', function () {
  let actionName = 'LOGIN';

  it('should support all format', function () {
    let actionName = 'LOGIN_1';
    const login = createActionAsync(actionName, () => Promise.resolve());
    expect(login).to.be.a('function');
    //expect(login.run).to.be.a('function');
    expect(login.request).to.be.a('function');
    expect(login.ok).to.be.a('function');
    expect(login.error).to.be.a('function');
  });
  it('run the action, ok', function () {
    let actionName = 'LOGIN_2';
    let user = {id: 8};
    function apiOk(){
      return Promise.resolve(user);
    }
    const login = createActionAsync(actionName, apiOk);
    const initialState = {
      authenticated: false,
    };

    let reducer = createReducer({
      [login.request]: (state, payload) => {
        console.log('login.request ', payload);
      },
      [login.ok]: (state, payload) => {
        console.log('login.ok ', payload);
      },
      [login.error]: (state, payload) => {
        console.log('login.error ', payload);
      }
    }, initialState);

    let run = login({username:'lolo', password: 'password'});

    const store = createStore(reducer, applyMiddleware(thunk));

    store.dispatch(run);

  });
  it('run the action, ko', function () {
    let actionName = 'LOGIN_3';
    let error = {name: 'myError'};
    function apiError(){
      return Promise.reject(error);
    }
    const login = createActionAsync(actionName, apiError);
    let run = login({username:'lolo', password: 'password'});
    function dispatch(action){
      console.log('dispatch action: ', action);
      //assert.equal(action.type, `${actionName}_ERROR`)
      //assert.equal(action.payload, error);
    }
    run(dispatch);
  });
});
