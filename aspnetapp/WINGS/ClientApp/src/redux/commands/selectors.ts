import { createSelector } from 'reselect';
import { RootState } from '../store/RootState';

const commandsSelector = (state: RootState) => state.cmds;

export const getCommands = createSelector(
  [commandsSelector],
  state => state.list
);

export const getTargets = createSelector(
  [commandsSelector],
  state => state.targets
);

export const getComponents = createSelector(
  [commandsSelector],
  state => state.components
);

export const getCommandLogs = createSelector(
  [commandsSelector],
  state => state.logs
);