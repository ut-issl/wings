import * as Actions from './actions';
import * as OperationActions from '../operations/actions';
import initialState from '../store/initialState';

type Actions = 
  | ReturnType<typeof Actions.updateTelemetryColorAction>
  | ReturnType<typeof Actions.updateLatestTelemetriesAction>
  | ReturnType<typeof Actions.updateTelemetryHistoriesAction>
  | ReturnType<typeof Actions.addTelemetryHistoriesAction>
  | ReturnType<typeof OperationActions.leaveOperationAction>
;

export const TelemetriesReducer = (state = initialState.tlms, action: Actions) => {
  switch (action.type) {
    case Actions.UPDATE_TELEMETRY_COLOR:
      return {
        ...state,
        tlmColor: action.payload 
      }

    case Actions.UPDATE_LATEST_TELEMETRY:
      const tlmPackets = action.payload;
      var tlms = state.latest;
      tlmPackets.forEach(tlmPacket => {
        if (tlms[tlmPacket.packetInfo.compoName] == undefined) {
          tlms[tlmPacket.packetInfo.compoName] = {};
        }
        tlms[tlmPacket.packetInfo.compoName][tlmPacket.packetInfo.name] = tlmPacket.telemetries;
      })
      return {
        ...state,
        latest: tlms
      }

    case Actions.UPDATE_TELEMETRY_HISTORY:
      const tlmPacketHistories = action.payload;
      let tlmHistories = state.history;
      tlmPacketHistories.forEach(tlmPacketHistory => {
        if (tlmHistories[tlmPacketHistory.packetInfo.compoName] == undefined) {
          tlmHistories[tlmPacketHistory.packetInfo.compoName] = {};
        }
        tlmHistories[tlmPacketHistory.packetInfo.compoName][tlmPacketHistory.packetInfo.name] = tlmPacketHistory.telemetryHistories;
      }, {})
      return {
        ...state,
        history: tlmHistories
      }

    case Actions.ADD_TELEMETRY_HISTORY:
      const latestTlms = action.payload;
      let tlmHstrs = state.history;
      if (latestTlms.length != 0){
        latestTlms.forEach(tlmPacket => {
          if (tlmPacket.telemetries[0].telemetryValue.time != null) {
            if (tlmHstrs[tlmPacket.packetInfo.compoName] == undefined) {
              tlmHstrs[tlmPacket.packetInfo.compoName] = {};
              tlmHstrs[tlmPacket.packetInfo.compoName][tlmPacket.packetInfo.name] = [];
            } else if (tlmHstrs[tlmPacket.packetInfo.compoName][tlmPacket.packetInfo.name] == undefined) {
              tlmHstrs[tlmPacket.packetInfo.compoName][tlmPacket.packetInfo.name] = [];
            }
            tlmHstrs[tlmPacket.packetInfo.compoName][tlmPacket.packetInfo.name].forEach((element, index) => {
              element.telemetryValues.push(tlmPacket.telemetries[index].telemetryValue);
            })
          }
        })
      }
      return {
        ...state,
        history: tlmHstrs
      }

    case OperationActions.LEAVE_OPERATION:
      return initialState.tlms;

    default:
      return state;
  }
};
