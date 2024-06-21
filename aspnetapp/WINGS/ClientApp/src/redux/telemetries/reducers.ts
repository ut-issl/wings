import * as Actions from './actions';
import * as OperationActions from '../operations/actions';
import initialState from '../store/initialState';
import { createSlice } from '@reduxjs/toolkit';

export const telemetriesSlice =  createSlice({
  name: 'telemetries',
  initialState: initialState.tlms,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(Actions.updateTelemetryColorAction, (state, action) => {
        state.tlmColor = action.payload;
      })
      .addCase(Actions.updateLatestTelemetriesAction, (state, action) => {
        action.payload.forEach((packet => {
          if(state.latest[packet.packetInfo.compoName] == undefined) {
            state.latest[packet.packetInfo.compoName] = {};
          }
          state.latest[packet.packetInfo.compoName][packet.packetInfo.name] = packet.telemetries;
        }))
      })
      .addCase(Actions.updateTelemetryHistoriesAction, (state, action) => {
        action.payload.forEach((packetHistory) => {
          if (state.history[packetHistory.packetInfo.compoName] == undefined) {
            state.history[packetHistory.packetInfo.compoName] = {};
          }
          state.history[packetHistory.packetInfo.compoName][packetHistory.packetInfo.name] = packetHistory.telemetryHistories;
        })
      })
      .addCase(Actions.addTelemetryHistoriesAction, (state, action) => {
        if (action.payload.length != 0) {
          action.payload.forEach((tlmPacket) => {
            if (tlmPacket.telemetries[0].telemetryValue.time != null) {
              if (state.history[tlmPacket.packetInfo.compoName] == undefined) {
                state.history[tlmPacket.packetInfo.compoName] = {};
                state.history[tlmPacket.packetInfo.compoName][tlmPacket.packetInfo.name] = [];
              } else if (state.history[tlmPacket.packetInfo.compoName][tlmPacket.packetInfo.name] == undefined) {
                state.history[tlmPacket.packetInfo.compoName][tlmPacket.packetInfo.name] = [];
              }
              state.history[tlmPacket.packetInfo.compoName][tlmPacket.packetInfo.name].forEach((element, index) => {
                element.telemetryValues.push(tlmPacket.telemetries[index].telemetryValue);
              })
            }
          })
        }
      })
      .addCase(OperationActions.leaveOperationAction, (state) => {
        state = initialState.tlms;
      })
  }
})

export default telemetriesSlice.reducer;
