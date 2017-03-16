import { createDevTools } from 'redux-devtools'
import LogMonitor from 'redux-devtools-log-monitor'
import DockMonitor from 'redux-devtools-dock-monitor'

import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers,applyMiddleware,compose } from 'redux'
import { Provider } from 'react-redux'
import  { createHistory } from 'history'
import { Match,Link, reduxRouter } from 'react-router-redux'
import { count } from './reducers'
import { App, Home, Foo, Bar } from './components'
var history = createHistory();
var historyChange = (routing,res,{getState,dispatch}) => {
  console.log(routing)
  dispatch({
    type: "INCREASE",
    amount: 1
  })
  if(getState().count.number>5){
    res();
    return;
  }
  setTimeout(()=>{
    res();
  },1000)
}

var { historyMiddleware, routing } = reduxRouter(history,[
    {name:"root",pattern:"/"},
    {name:"foo",pattern:"/foo"},
    {name:"bar",pattern:"/bar"}
    ],historyChange);
const reducer = combineReducers(Object.assign({
  count,
  routing:routing
}))
const DevTools = createDevTools(
  <DockMonitor toggleVisibilityKey="ctrl-h" changePositionKey="ctrl-q">
    <LogMonitor theme="tomorrow" preserveScrollTop={false} />
  </DockMonitor>
)

const middleware = applyMiddleware(historyMiddleware)
const enhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__(middleware)
const store = createStore(
  reducer,
  enhancer
)


ReactDOM.render(
  <Provider store={store}>
    <div>
      <Match name="root">
          <App history={history}>
            <Match name="root" isExactly={true}>
              <Home/>
            </Match>
            <Match name="foo" isExactly={true}>
              <div>
                <Home/>
                <Foo/>
              </div>
            </Match>
            <Match name="bar" isExactly={true}>
              <Bar/>
            </Match>
          </App>  
        </Match>
      <DevTools/>
    </div>
  </Provider>,
  document.getElementById('mount')
)
