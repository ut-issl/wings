import { TelemetryPacket, TelemetryPacketHistory } from "../../models";

export const UPDATE_LATEST_TELEMETRY = 'UPDATE_LATEST_TELEMETRY' as const;
export const UPDATE_TELEMETRY_HISTORY = 'UPDATE_TELEMETRY_HISTORY' as const;
export const ADD_TELEMETRY_HISTORY = 'ADD_TELEMETRY_HISTORY' as const;

export const updateLatestTelemetriesAction = (telemetries: TelemetryPacket[]) => {
  return {
    type: UPDATE_LATEST_TELEMETRY,
    payload: telemetries
  };
};

export const updateTelemetryHistoriesAction = (telemetryHistories: TelemetryPacketHistory[]) => {
  return {
    type: UPDATE_TELEMETRY_HISTORY,
    payload: telemetryHistories
  };
};

export const addTelemetryHistoriesAction = (telemetries: TelemetryPacket[]) => {
  return {
    type: ADD_TELEMETRY_HISTORY,
    payload: telemetries
  };
};
