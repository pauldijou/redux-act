import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import Counter from './components/Counter'
import counter, { increment, decrement} from './reducers'

const store = createStore(counter)
const rootEl = document.getElementById('root')

function render() {
  ReactDOM.render(
    <Counter
      value={store.getState()}
      onIncrement={() => store.dispatch(increment())}
      onDecrement={() => store.dispatch(decrement())}
    />,
    rootEl
  )
}

render()
store.subscribe(render)
