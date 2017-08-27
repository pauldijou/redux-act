// Generic stuff
interface Identity<T> {
  (arg: T): T
}

interface Action<P, M={}> {
  type: string;
  payload: P;
  meta?: M;
}

interface Dispatch {
  (action: Action<any, any>): Action<any, any>;
}

interface Unsubscribe {
  (): void;
}

interface Store<S> {
  getState(): S;
  subscribe(listener: () => void): Unsubscribe;
  replaceReducer(nextReducer: Reducer<S>): void;
  dispatch(action: Action<any, any>): Action<any, any>;
}

interface StoreWithDisbatch<S> extends Store<S> {
  disbatch(...actions: Action<any, any>[]): Action<any, any>;
  disbatch(actions: Action<any, any>[]): Action<any, any>;
}

type StoreOrDispatch = Store<any> | Dispatch | Store<any>[] | Dispatch[]

interface BaseActionCreator<T> {
  getType(): string;

  assigned(): boolean;
  bound(): boolean;
  dispatched(): boolean;

  assignTo(arg: StoreOrDispatch): T;
  bindTo(arg: StoreOrDispatch): T;
}

// Action creators
interface ComplexActionCreator<P, M={}> extends BaseActionCreator<ComplexActionCreator<P, M>> {
  (...args: any[]): Action<P, M>;

  raw(...args: any[]): Action<P, M>;
}

interface SimpleActionCreator<P, M={}> extends BaseActionCreator<SimpleActionCreator<P, M>>  {
  (payload: P): Action<P, M>;

  raw(payload: P): Action<P, M>;
}

interface EmptyActionCreator extends BaseActionCreator<EmptyActionCreator> {
  (): Action<null, null>;

  raw(): Action<null, null>;
}

type ActionCreator<P, M={}> = SimpleActionCreator<P, M> | ComplexActionCreator<P, M> | EmptyActionCreator;

export function createAction(): EmptyActionCreator;
export function createAction(description: string): EmptyActionCreator;
export function createAction<P, M={}>(): SimpleActionCreator<P, M>;
export function createAction<P, M={}>(description: string): SimpleActionCreator<P, M>;
export function createAction<P, M={}>(description: string, payloadReducer: (...args: any[]) => P): ComplexActionCreator<P, M>;
export function createAction<P, M={}>(description: string, payloadReducer: (...args: any[]) => P, metaReducer?: (...args: any[]) => M): ComplexActionCreator<P, M>;
export function createAction<P, M={}>(payloadReducer: (...args: any[]) => P, metaReducer?: (...args: any[]) => M): ComplexActionCreator<P, M>;


// Reducers
type Handler<S, P, M={}> = (state: S, payload: P, meta?: M) => S
type ActionCreatorOrString<P, M={}> = ActionCreator<P, M> | string

interface Reducer<S> {
  (state: S, action: Action<any, any>): S

  options(opts: Object): Reducer<S>
  has(actionCreator: ActionCreatorOrString<any, any>): boolean
  on<P, M={}>(actionCreator: ActionCreatorOrString<P, M>, handler: Handler<S, P, M>): Reducer<S>
  off(actionCreator: ActionCreatorOrString<any, any>): Reducer<S>
}

interface Handlers<S> {
  [propertyName: string]: Handler<S, any, any>
}

type functionOn<S, P, M={}> = (actionCreator: ActionCreatorOrString<P, M>, handler: Handler<S, P, M>) => Reducer<S>
type functionOff<S> = (actionCreator: ActionCreatorOrString<any, any>) => Reducer<S>

interface OnOff<S> {
  (on: functionOn<S, any, any>, off: functionOff<S>): void;
}

export function createReducer<S>(handlers: Handlers<S> | OnOff<S>, defaultState?: S): Reducer<S>;


// doAll
interface ActionCreators {
  [propertyName: string]: ActionCreator<any, any>
}

export function assignAll(actionCreators: ActionCreators | ActionCreator<any, any>[], stores: StoreOrDispatch): void;
export function bindAll(actionCreators: ActionCreators | ActionCreator<any, any>[], stores: StoreOrDispatch): void;

// Batching
export const batch: ComplexActionCreator<Action<any, any>[],null>

export function disbatch(store: Store<any>): StoreWithDisbatch<any>;
export function disbatch(store: Store<any>, ...actions: Action<any, any>[]): void;
export function disbatch(store: Store<any>, actions: Action<any, any>[]): void;


// types
export namespace types {
  export function add(t: string): void;
  export function remove(t: string): void;
  export function has(t: string): boolean;
  export function all(): string[];
  export function clear(): void;
}
