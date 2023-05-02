import { createSelector } from 'reselect';
import { FileIndex } from '../../models';
import { RootState } from '../store/RootState';

const plansSelector = (state: RootState) => state.plans;

export const getAllIndexes = createSelector(
  [plansSelector],
  state => state.allIndexes
);

export const getActivePlanId = createSelector(
  [plansSelector],
  state => state.activeId
);

export const getOpenedPlanIds = createSelector(
  [plansSelector],
  state => state.openedIds
);

export const getOpenedPlanIndexes = createSelector(
  [plansSelector],
  state => state.openedIds.map(id => state.allIndexes.find(index => index.id === id)) as FileIndex[]
);

export const getPlanContents = createSelector(
  [plansSelector],
  state => state.contents
);

export const getSelectedRow = createSelector(
  [plansSelector],
  state => state.selectedRow
);

export const getCommandFileVariables = createSelector(
  [plansSelector],
  state => state.cmdFileVariables
)

export const getSelectedCommand = createSelector(
  [plansSelector],
  state => state.selectedCommand
);

export const getInExecution = createSelector(
  [plansSelector],
  state => state.inExecution
);

