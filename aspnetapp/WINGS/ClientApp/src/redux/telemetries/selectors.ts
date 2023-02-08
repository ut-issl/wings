import { createSelector } from 'reselect';
import { RootState } from '../store/RootState';

const telemetriesSelector = (state: RootState) => state.tlms;

export const getTelemetryColor = createSelector(
  [telemetriesSelector],
  state => state.tlmColor
);

export const getLatestTelemetries = createSelector(
  [telemetriesSelector],
  state => state.latest
);

export const getTelemetryHistories = createSelector(
  [telemetriesSelector],
  state => state.history
);