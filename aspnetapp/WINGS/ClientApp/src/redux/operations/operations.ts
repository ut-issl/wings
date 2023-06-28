import { Dispatch } from "redux";
import { Operation, Command, CommandPlanIndex, TelemetryPacket, TelemetryPacketHistory, Layout, TelemetryViewIndex, CommandFileLineLogs, TelemetryColor } from "../../models";
import { joinOperationAction, leaveOperationAction } from './actions';
import { fetchCommandsAction } from '../commands/actions';
import { fetchPlanIndexesAction } from '../plans/actions';
import { fetchViewIndexesAction } from '../views/actions';
import { fetchLayoutsAction } from '../views/actions';
import { updateTelemetryColorAction, updateTelemetryHistoriesAction } from '../telemetries/actions';
import { updateCommandLogAction } from "../commands/actions";

export const joinOperation = (operation: Operation) => {
  return async (dispatch: Dispatch) => {
    const opid = operation.id;

    dispatch(leaveOperationAction());
    dispatch(joinOperationAction(operation));

    const resCmds = await fetch(`/api/operations/${opid}/cmd`, {
      method: 'GET'
    });
    if (resCmds.status == 200) {
      const jsonCmds = await resCmds.json();
      const cmds = jsonCmds.data as Command[];
      dispatch(fetchCommandsAction(cmds));
    }

    const resPlans = await fetch(`/api/operations/${opid}/cmd_plans`, {
      method: 'GET'
    });
    if (resPlans.status == 200) {
      const jsonPlans = await resPlans.json();
      const indexesNum = jsonPlans.data;
      const planIndexes: CommandPlanIndex[] = indexesNum.length > 0 ? indexesNum.map((idx: any, index: number) => ({ ...idx, id: String(index) })) : [];
      dispatch(fetchPlanIndexesAction(planIndexes));
    }

    const resCmdLog = await fetch(`/api/operations/${opid}/cmd_fileline/log`, {
      method: 'GET'
    });
    const jsonCmdLog = await resCmdLog.json();
    const dataCmdLog: CommandFileLineLogs[] = jsonCmdLog.data;
    dispatch(updateCommandLogAction(dataCmdLog));

    const tlmColor: TelemetryColor = require("../../assets/tlm/telemetryColor.json");
    dispatch(updateTelemetryColorAction(tlmColor));

    const resTlms = await fetch(`/api/operations/${opid}/tlm`, {
      method: 'GET'
    });
    if (resTlms.status == 200) {
      const jsonTlms = await resTlms.json();
      const tlmPackets = jsonTlms.data as TelemetryPacket[];
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
      const jsonLyts = await resLyts.json();
      const lyts = jsonLyts.data as Layout[];
      dispatch(fetchLayoutsAction(lyts));
    }
  }
}
