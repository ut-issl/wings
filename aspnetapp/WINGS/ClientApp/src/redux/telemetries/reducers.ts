import * as Actions from './actions';
import * as OperationActions from '../operations/actions';
import initialState from '../store/initialState';

type Actions = 
  | ReturnType<typeof Actions.updateLatestTelemetriesAction>
  | ReturnType<typeof Actions.updateTelemetryHistoriesAction>
  | ReturnType<typeof Actions.addTelemetryHistoriesAction>
  | ReturnType<typeof OperationActions.leaveOperationAction>
;

export const TelemetriesReducer = (state = initialState.tlms, action: Actions) => {
  switch (action.type) {
    case Actions.UPDATE_LATEST_TELEMETRY:
      const tlmPackets = action.payload;
      var tlms = state.latest;
      tlmPackets.forEach(tlmPacket => {
        tlms[tlmPacket.packetInfo.name] = tlmPacket.telemetries;
      })
      return {
        ...state,
        latest: tlms
      }

    case Actions.UPDATE_TELEMETRY_HISTORY:
      const tlmPacketHistories = action.payload;
      const tlmHistories = tlmPacketHistories.reduce((list, tlmPacketHistory) => ({ ...list, [tlmPacketHistory.packetInfo.name]: tlmPacketHistory.telemetryHistories }), {})
      return {
        ...state,
        history: tlmHistories
      }

    case Actions.ADD_TELEMETRY_HISTORY:
      const latestTlms = action.payload;
      let tlmHstrs = state.history;
      if (latestTlms != []){
        latestTlms.forEach(tlmPacket => {
          if(tlmPacket.telemetries[0].telemetryValue.time != null) {
            tlmHstrs[tlmPacket.packetInfo.name].forEach((element, index) => {
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
