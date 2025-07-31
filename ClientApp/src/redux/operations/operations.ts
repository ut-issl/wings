import { Dispatch } from "redux";
import { Operation, CommandPlanIndex, TelemetryPacketHistory, TelemetryViewIndex, TelemetryColor, TlmCmdConfigurationInfo, CommandsJson, CommandPlanIndexJson, CommandLogsJson, TelemetryPacketJson, LayoutJson, TlmCmdConfigInfoJson } from "../../models";
import { joinOperationAction, leaveOperationAction, fetchTlmCmdConfigAction } from './actions';
import { fetchCommandsAction } from '../commands/actions';
import { fetchPlanIndexesAction } from '../plans/actions';
import { fetchViewIndexesAction } from '../views/actions';
import { fetchLayoutsAction } from '../views/actions';
import { updateTelemetryColorAction, updateTelemetryHistoriesAction } from '../telemetries/actions';
import { updateCommandLogAction } from "../commands/actions";
import tlmColor from "../../assets/tlm/telemetryColor.json";

export const joinOperation = (operation: Operation) => {
  return async (dispatch: Dispatch) => {
    const opid = operation.id;

    dispatch(leaveOperationAction());
    dispatch(joinOperationAction(operation));

    const resCmds = await fetch(`/api/operations/${opid}/cmd`, {
      method: 'GET'
    });
    if (resCmds.status == 200) {
      const jsonCmds = await resCmds.json() as CommandsJson;
      const cmds = jsonCmds.data;
      dispatch(fetchCommandsAction(cmds));
    }

    const resPlans = await fetch(`/api/operations/${opid}/cmd_plans`, {
      method: 'GET'
    });
    if (resPlans.status == 200) {
      const jsonPlans = await resPlans.json() as CommandPlanIndexJson;
      let planIndexes = jsonPlans.data;
      planIndexes = planIndexes.length > 0 ? planIndexes.map((idx: CommandPlanIndex, index: number) => ({ ...idx, id: String(index) })) : [];
      dispatch(fetchPlanIndexesAction(planIndexes));
    }

    const resCmdLog = await fetch(`/api/operations/${opid}/cmd_fileline/log`, {
      method: 'GET'
    });
    const jsonCmdLog = await resCmdLog.json() as CommandLogsJson;
    const dataCmdLog = jsonCmdLog.data;
    dispatch(updateCommandLogAction(dataCmdLog));

    dispatch(updateTelemetryColorAction(tlmColor as TelemetryColor));

    const resTlms = await fetch(`/api/operations/${opid}/tlm`, {
      method: 'GET'
    });
    if (resTlms.status == 200) {
      const jsonTlms = await resTlms.json() as TelemetryPacketJson;
      const tlmPackets = jsonTlms.data;
      const packetIndexes: TelemetryViewIndex[] = tlmPackets.map(packet => ({ id: packet.packetInfo.name + "_packet", name: packet.packetInfo.name, filePath: "", tlmApid: packet.packetInfo.tlmApid, packetId: packet.packetInfo.id, compoName: packet.packetInfo.compoName, type: "packet", selectedTelemetries: [], dataType: "Default", dataLength: "500", ylabelMin: "", ylabelMax: "" }));
      const graphIndexes: TelemetryViewIndex[] = tlmPackets.map(packet => ({ id: packet.packetInfo.name + "_graph", name: packet.packetInfo.name, filePath: "", tlmApid: packet.packetInfo.tlmApid, packetId: packet.packetInfo.id, compoName: packet.packetInfo.compoName, type: "graph", selectedTelemetries: [], dataType: "Default", dataLength: "500", ylabelMin: "", ylabelMax: "" }));
      const viewIndexes = [...packetIndexes, ...graphIndexes];
      dispatch(fetchViewIndexesAction(viewIndexes));

      const dataTlmHistory: TelemetryPacketHistory[] = [];
      tlmPackets.forEach(tlmPacket => {
        const tlmPacketHistoryTmp: TelemetryPacketHistory = {
          packetInfo: tlmPacket.packetInfo, telemetryHistories: tlmPacket.telemetries.map(tlm => ({ telemetryInfo: tlm.telemetryInfo, telemetryValues: [tlm.telemetryValue] }))
        };
        dataTlmHistory.push(tlmPacketHistoryTmp);
      });
      dispatch(updateTelemetryHistoriesAction(dataTlmHistory));
    }

    const resLyts = await fetch(`/api/operations/${opid}/lyt`, {
      method: 'GET'
    });
    if (resLyts.status == 200) {
      const jsonLyts = await resLyts.json() as LayoutJson;
      const lyts = jsonLyts.data;
      dispatch(fetchLayoutsAction(lyts));
    }

    const resTlmCmdConfig = await fetch(`/api/operations/${opid}/tlm_cmd_config`, {
      method: 'GET'
    });
    if (resTlmCmdConfig.status == 200) {
      const jsonTlmCmdConfig = await resTlmCmdConfig.json() as TlmCmdConfigInfoJson;
      const tlmCmdConfig = jsonTlmCmdConfig.data;
      dispatch(fetchTlmCmdConfigAction(tlmCmdConfig));
    }
  }
}
