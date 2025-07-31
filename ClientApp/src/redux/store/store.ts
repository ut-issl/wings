import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { combineReducers, compose } from 'redux';
import { thunk } from 'redux-thunk';
import logger from 'redux-logger';
import { uiSlice } from '../ui/reducers';
import { operationsSlice } from '../operations/reducers';
import { commandsSlice } from '../commands/reducers';
import { telemetriesSlice } from '../telemetries/reducers';
import { plansSlice } from '../plans/reducers';
import { viewsSlice } from '../views/reducers';
import { RootState } from './RootState';

interface ExtendedWindow extends Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
}
declare let window: ExtendedWindow;

const composeReduxDevToolsEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

export const rootReducer = combineReducers({
  ui: uiSlice.reducer,
  operation: operationsSlice.reducer,
  cmds: commandsSlice.reducer,
  tlms: telemetriesSlice.reducer,
  plans: plansSlice.reducer,
  views: viewsSlice.reducer
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // ここでシリアライズチェックを無効にする
      immutableCheck: false, // ここで不変性チェックを無効にする
    }).concat(logger, thunk),
  // enhancers: composeReduxDevToolsEnhancers
});

export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export default function createStore() {
  return store;
}
