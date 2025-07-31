import { createSelector } from 'reselect';
import { RootState } from '../store/RootState';

const uiSelector = (state: RootState) => state.ui;

export const getIsLoading = createSelector(
  [uiSelector],
  state => state.isLoading
);

export const getErrorDialogState = createSelector(
  [uiSelector],
  state => state.errorDialog
);
