import { createSelector } from 'reselect';
import { RootState } from '../store/RootState';

const operationsSelector = (state: RootState) => state.operation;

export const getOpid = createSelector(
  [operationsSelector],
  state => state.id
);

export const getCurrentOperation = createSelector(
  [operationsSelector],
  state => state
);
