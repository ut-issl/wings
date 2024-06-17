import {
  combineReducers,
  applyMiddleware,
  compose
} from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import * as H from 'history';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import thunk from 'redux-thunk';
import { UIReducer } from '../ui/reducers';
import { OperationsReducer } from '../operations/reducers';
import { CommandsReducer } from '../commands/reducers';
import { TelemetriesReducer } from '../telemetries/reducers';
import { PlansReducer } from '../plans/reducers';
import { ViewsReducer } from '../views/reducers';

interface ExtendedWindow extends Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
}
declare var window: ExtendedWindow;

const composeReduxDevToolsEnhancers = typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function createStore(history: H.History) {
  let reducer = combineReducers({
    router: connectRouter(history),
    ui: UIReducer,
    operation: OperationsReducer,
    cmds: CommandsReducer,
    tlms: TelemetriesReducer,
    plans: PlansReducer,
    views: ViewsReducer
  });
  let enhancer = composeReduxDevToolsEnhancers(
    applyMiddleware(
      routerMiddleware(history),
      thunk
  ));
  return configureStore({reducer})
}
