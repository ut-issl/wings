import { createSelector } from 'reselect';
import { RootState } from '../store/RootState';

const viewsSelector = (state: RootState) => state.views;

export const getAllIndexes = createSelector(
  [viewsSelector],
  state => state.currentView.allIndexes
);

export const getPacketNames = createSelector(
  [viewsSelector],
  state => state.currentView.allIndexes.filter(index => index.type === "packet")
);

export const getBlockInfos = createSelector(
  [viewsSelector],
  state => state.currentView.blocks
);

export const getViewContents = createSelector(
  [viewsSelector],
  state => state.currentView.contents
);

export const getViewLayout = createSelector(
  [viewsSelector],
  state => state.currentView
);

export const getLayouts = createSelector(
  [viewsSelector],
  state => state.layoutList
);
