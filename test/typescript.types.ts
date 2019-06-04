import {
  createAction, createReducer, batch, disbatch, types
} from '../types'
import {combineReducers} from 'redux';

const actionCreators = [
  createAction(),
  createAction<string>('aze'),
  createAction('aze', () => true),
  createAction('aze', () => true, () => 1),
  createAction(() => 1),
  createAction(() => "a", () => true),
  createAction('aze', ({ a }) => ({ a }), ({ a }) => ({ a })),
  createAction('aze', ({ a }, { b }) => ({ a, b }), ({ a }, { b }) => ({ a, b })),
  createAction(({ a }) => ({ a }), ({ a }) => ({ a })),
  createAction(({ a }, { b }) => ({ a, b }), ({ a }, { b }) => ({ a, b })),
]

const act1 = createAction((count: number) => count + 1)

const simpleAct = createAction<boolean>('something');

// Simple actions provide validation on params.
const action = simpleAct(true);

const emptyAction = createAction('label');

// Empty actions don't have payload.
emptyAction();

// Invalid: emptyAction(null);

function onOff(on, off) {
  on(act1, () => 1)
}
const a1 = createReducer({});
const reducers = combineReducers({
  a1, 
  a2 :createReducer({}, {}),
  a3 :createReducer<number>({ [act1.getType()]: () => 1 }, 0),
  a4 :createReducer<boolean>(onOff, true),
  a5 :createReducer<number>(onOff, 1)
});

const batches = [
  batch(act1(), act1()),
  batch([act1(), act1()])
]

types.add('one')
types.add('two')
types.remove('two')
const whatever1 = (true === types.has('one'))
const whatever2 = (false === types.has('two'))
const whatever3 = (['one'] === types.all())
types.clear()
