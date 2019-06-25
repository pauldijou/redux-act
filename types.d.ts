import * as Redux from 'redux'

// Generic stuff
interface Identity<T> {
  (arg: T): T
}

interface Action<P, M={}> {
  type: string;
  payload: P;
  error: boolean;
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
  asError(...args: any[]): Action<P, M>;
}

interface ComplexActionCreator1<Arg1, P, M={}> extends BaseActionCreator<ComplexActionCreator<P, M>> {
  (arg1: Arg1): Action<P, M>;

  raw(arg1: Arg1): Action<P, M>;
  asError(arg1: Arg1): Action<P, M>;
}

interface ComplexActionCreator2<Arg1, Arg2, P, M={}> extends BaseActionCreator<ComplexActionCreator<P, M>> {
  (arg1: Arg1, arg2: Arg2): Action<P, M>;

  raw(arg1: Arg1, arg2: Arg2): Action<P, M>;
  asError(arg1: Arg1, arg2: Arg2): Action<P, M>;
}

interface ComplexActionCreator3<Arg1, Arg2, Arg3, P, M={}> extends BaseActionCreator<ComplexActionCreator<P, M>> {
  (arg1: Arg1, arg2: Arg2, arg3: Arg3): Action<P, M>;

  raw(arg1: Arg1, arg2: Arg2, arg3: Arg3): Action<P, M>;
  asError(arg1: Arg1, arg2: Arg2, arg3: Arg3): Action<P, M>;
}

interface ComplexActionCreator4<Arg1, Arg2, Arg3, Arg4, P, M={}> extends BaseActionCreator<ComplexActionCreator<P, M>> {
  (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4): Action<P, M>;

  raw(arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4): Action<P, M>;
  asError(arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4): Action<P, M>;
}

interface ComplexActionCreator5<Arg1, Arg2, Arg3, Arg4, Arg5, P, M={}> extends BaseActionCreator<ComplexActionCreator<P, M>> {
  (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5): Action<P, M>;

  raw(arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5): Action<P, M>;
  asError(arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5): Action<P, M>;
}

interface ComplexActionCreator6<Arg1, Arg2, Arg3, Arg4, Arg5, Arg6, P, M={}> extends BaseActionCreator<ComplexActionCreator<P, M>> {
  (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5, arg6: Arg6): Action<P, M>;

  raw(arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5, arg6: Arg6): Action<P, M>;
  asError(arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5, arg6: Arg6): Action<P, M>;
}

interface SimpleActionCreator<P, M={}> extends BaseActionCreator<SimpleActionCreator<P, M>>  {
  (payload: P): Action<P, M>;

  raw(payload: P): Action<P, M>;
  asError(payload: P): Action<P, M>;
}

interface EmptyActionCreator extends BaseActionCreator<EmptyActionCreator> {
  (): Action<null, null>;

  raw(): Action<null, null>;
  asError(): Action<null, null>;
}

type ActionCreator<P, M={}> = SimpleActionCreator<P, M> | ComplexActionCreator<P, M> | EmptyActionCreator;
type ActionCreator1<Arg1, P, M={}> = ComplexActionCreator1<Arg1, P, M>;
type ActionCreator2<Arg1, Arg2, P, M={}> = ComplexActionCreator2<Arg1, Arg2, P, M>;
type ActionCreator3<Arg1, Arg2, Arg3, P, M={}> = ComplexActionCreator3<Arg1, Arg2, Arg3, P, M>;
type ActionCreator4<Arg1, Arg2, Arg3, Arg4, P, M={}> = ComplexActionCreator4<Arg1, Arg2, Arg3, Arg4, P, M>;
type ActionCreator5<Arg1, Arg2, Arg3, Arg4, Arg5, P, M={}> = ComplexActionCreator5<Arg1, Arg2, Arg3, Arg4, Arg5, P, M>;
type ActionCreator6<Arg1, Arg2, Arg3, Arg4, Arg5, Arg6, P, M={}> = ComplexActionCreator6<Arg1, Arg2, Arg3, Arg4, Arg5, Arg6, P, M>;

type PayloadReducer<P> = (...args: any[]) => P
type PayloadReducer1<Arg1, P> = (arg1: Arg1) => P
type PayloadReducer2<Arg1, Arg2, P> = (arg1: Arg1, arg2: Arg2) => P
type PayloadReducer3<Arg1, Arg2, Arg3, P> = (arg1: Arg1, arg2: Arg2, arg3: Arg3) => P
type PayloadReducer4<Arg1, Arg2, Arg3, Arg4, P> = (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4) => P
type PayloadReducer5<Arg1, Arg2, Arg3, Arg4, Arg5, P> = (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5) => P
type PayloadReducer6<Arg1, Arg2, Arg3, Arg4, Arg5, Arg6, P> = (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5, arg6: Arg6) => P

type MetaReducer<M> = (...args: any[]) => M

export function createAction(): EmptyActionCreator;
export function createAction(description: string): EmptyActionCreator;
export function createAction<P, M={}>(): SimpleActionCreator<P, M>;
export function createAction<P, M={}>(description: string): SimpleActionCreator<P, M>;

export function createAction<Arg1, P, M={}>(description: string, payloadReducer: PayloadReducer1<Arg1, P>, metaReducer?: MetaReducer<M>): ComplexActionCreator1<Arg1, P, M>;
export function createAction<Arg1, Arg2, P, M={}>(description: string, payloadReducer: PayloadReducer2<Arg1, Arg2, P>, metaReducer?: MetaReducer<M>): ComplexActionCreator2<Arg1, Arg2, P, M>;
export function createAction<Arg1, Arg2, Arg3, P, M={}>(description: string, payloadReducer: PayloadReducer3<Arg1, Arg2, Arg3, P>, metaReducer?: MetaReducer<M>): ComplexActionCreator3<Arg1, Arg2, Arg3, P, M>;
export function createAction<Arg1, Arg2, Arg3, Arg4, P, M={}>(description: string, payloadReducer: PayloadReducer4<Arg1, Arg2, Arg3, Arg4, P>, metaReducer?: MetaReducer<M>): ComplexActionCreator4<Arg1, Arg2, Arg3, Arg4, P, M>;
export function createAction<Arg1, Arg2, Arg3, Arg4, Arg5, P, M={}>(description: string, payloadReducer: PayloadReducer5<Arg1, Arg2, Arg3, Arg4, Arg5, P>, metaReducer?: MetaReducer<M>): ComplexActionCreator5<Arg1, Arg2, Arg3, Arg4, Arg5, P, M>;
export function createAction<Arg1, Arg2, Arg3, Arg4, Arg5, Arg6, P, M={}>(description: string, payloadReducer: PayloadReducer6<Arg1, Arg2, Arg3, Arg4, Arg5, Arg6, P>, metaReducer?: MetaReducer<M>): ComplexActionCreator6<Arg1, Arg2, Arg3, Arg4, Arg5, Arg6, P, M>;

export function createAction<P, M={}>(description: string, payloadReducer:PayloadReducer<P>): ComplexActionCreator<P, M>;
export function createAction<P, M={}>(description: string, payloadReducer: PayloadReducer<P>, metaReducer?: MetaReducer<M>): ComplexActionCreator<P, M>;
export function createAction<P, M={}>(payloadReducer: PayloadReducer<P>, metaReducer?: MetaReducer<M>): ComplexActionCreator<P, M>;


// Reducers
type Handler<S, P, M={}> = (state: S, payload: P, meta?: M) => S
type ActionCreatorOrString<P, M={}> = ActionCreator<P, M> | string
type ActionCreatorOrString1<Arg1, P, M={}> = ActionCreator1<Arg1, P, M> | string
type ActionCreatorOrString2<Arg1, Arg2, P, M={}> = ActionCreator2<Arg1, Arg2, P, M> | string
type ActionCreatorOrString3<Arg1, Arg2, Arg3, P, M={}> = ActionCreator3<Arg1, Arg2, Arg3, P, M> | string
type ActionCreatorOrString4<Arg1, Arg2, Arg3, Arg4, P, M={}> = ActionCreator4<Arg1, Arg2, Arg3, Arg4, P, M> | string
type ActionCreatorOrString5<Arg1, Arg2, Arg3, Arg4, Arg5, P, M={}> = ActionCreator5<Arg1, Arg2, Arg3, Arg4, Arg5, P, M> | string
type ActionCreatorOrString6<Arg1, Arg2, Arg3, Arg4, Arg5, Arg6, P, M={}> = ActionCreator6<Arg1, Arg2, Arg3, Arg4, Arg5, Arg6, P, M> | string

interface Reducer<S, A extends Redux.Action = Redux.AnyAction> {
  (state: S | undefined, action: A): S

  options(opts: Object): Reducer<S>
  has(actionCreator: ActionCreatorOrString<any, any>): boolean
  on<Arg1, P, M={}>(actionCreator: ActionCreatorOrString1<Arg1, P, M>, handler: Handler<S, P, M>): Reducer<S>
  on<Arg1, Arg2, P, M={}>(actionCreator: ActionCreatorOrString2<Arg1, Arg2, P, M>, handler: Handler<S, P, M>): Reducer<S>
  on<Arg1, Arg2, Arg3, P, M={}>(actionCreator: ActionCreatorOrString3<Arg1, Arg2, Arg3, P, M>, handler: Handler<S, P, M>): Reducer<S>
  on<Arg1, Arg2, Arg3, Arg4, P, M={}>(actionCreator: ActionCreatorOrString4<Arg1, Arg2, Arg3, Arg4, P, M>, handler: Handler<S, P, M>): Reducer<S>
  on<Arg1, Arg2, Arg3, Arg4, Arg5, P, M={}>(actionCreator: ActionCreatorOrString5<Arg1, Arg2, Arg3, Arg4, Arg5, P, M>, handler: Handler<S, P, M>): Reducer<S>
  on<Arg1, Arg2, Arg3, Arg4, Arg5, Arg6, P, M={}>(actionCreator: ActionCreatorOrString6<Arg1, Arg2, Arg3, Arg4, Arg5, Arg6, P, M>, handler: Handler<S, P, M>): Reducer<S>
  on<P, M={}>(actionCreator: ActionCreatorOrString<P, M>, handler: Handler<S, P, M>): Reducer<S>
  off(actionCreator: ActionCreatorOrString<any, any>): Reducer<S>
}

interface Handlers<S> {
  [propertyName: string]: Handler<S, any, any>
}

type functionOn<S> = <P, M>(actionCreator: ActionCreatorOrString<P, M>, handler: Handler<S, P, M>) => Reducer<S>
type functionOff<S> = (actionCreator: ActionCreatorOrString<any, any>) => Reducer<S>

interface OnOff<S> {
  (on: functionOn<S>, off: functionOff<S>): void;
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

//Loggers
interface Loggers {
  reduxLogger: {
    logger: {}
    actionTransformer(action: Action<any, any>): Action<any, any>
  }
}

export const loggers: Loggers;

// asError
export function asError<P, M>(action: Action<P, M>): Action<P, M>;

// types
export namespace types {
  export function add(t: string): void;
  export function remove(t: string): void;
  export function has(t: string): boolean;
  export function all(): string[];
  export function clear(): void;
  export function disableChecking(): void;
  export function enableChecking(): void;
}
