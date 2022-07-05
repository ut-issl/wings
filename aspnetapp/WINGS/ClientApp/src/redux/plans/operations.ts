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

export const postCommand = (row: number, req: Request, ret: boolean[]) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const opid = getState().operation.id;
    const res = await fetch(`/api/operations/${opid}/cmd`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },      body: JSON.stringify({ command : req.body })
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
