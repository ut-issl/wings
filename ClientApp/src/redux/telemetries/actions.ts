import { createAction } from "@reduxjs/toolkit";
import { TelemetryColor, TelemetryPacket, TelemetryPacketHistory } from "../../models";

export const updateTelemetryColorAction = createAction<TelemetryColor>('telemetries/updateTlmColor');
export const updateLatestTelemetriesAction = createAction<TelemetryPacket[]>('telemetries/updateLatestTelemetries');
export const updateTelemetryHistoriesAction = createAction<TelemetryPacketHistory[]>('telemetries/updateTelemetryHistories');
export const addTelemetryHistoriesAction = createAction<TelemetryPacket[]>('telemetries/addTelemetryHistories');
