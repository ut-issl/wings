import { Dispatch } from "redux";
import { RootState } from "../store/RootState";
import { Request, CommandPlanLine } from '../../models';
import * as Actions from './actions';
import * as UiActions from '../ui/actions';

export const openPlan = (id: string) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const opid = getState().operation.id;
    const indexTemp = getState().plans.allIndexes.find(a => a.id === id);
    const cmdFileInfoIndex = (indexTemp != null)?indexTemp.cmdFileInfoIndex:"";
    const fileId = (indexTemp != null) ?indexTemp.fileId:"";
    const res = await fetch(`/api/operations/${opid}/cmd_plans/${cmdFileInfoIndex}/${fileId}`, {
      method: 'GET'
    });
    const json = await res.json();
    if (res.status === 200) {
      const data = json.data.content as Request[];
      dispatch(Actions.openPlanAction(id, data));
    } else {
      const message = `Status Code: ${res.status}\n${json.message ? json.message: "unknown error"}`;
      dispatch(UiActions.openErrorDialogAction(message));
    }
  }
};

export const postCommand = (row: number, cmdType: string, req: Request, paramsValue: string[], ret: boolean[]) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const opid = getState().operation.id;
    var body = JSON.parse(JSON.stringify(req.body));
    if (paramsValue.length != 0) {
      for (var i = 0; i < paramsValue.length; i++) {
        body.params[i].value = paramsValue[i];
      }
    }
    let cmd_uri :string;
    if (cmdType == "Type-A")
    {
      cmd_uri = "cmd_typeA";
    }
    else {
      cmd_uri = "cmd";
    }
    const res = await fetch(`/api/operations/${opid}/${cmd_uri}`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },      body: JSON.stringify({ command : body })
    });
    const json = await res.json();
    if (res.status === 200 && json.ack) {
      await dispatch(Actions.execRequestSuccessAction(row));
      ret[0] = true;
    } else {
      await dispatch(Actions.execRequestErrorAction(row));
      ret[0] = false;
    }
  }
};

export const postCommandFileLineLog = (content: CommandPlanLine) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const opid = getState().operation.id;
    const res = await fetch(`/api/operations/${opid}/cmd_fileline_log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ command_file_line_log: content })
    });
    const json = await res.json();
  }
};
