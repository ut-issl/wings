import { Command, CommandPlanLine, FileIndex, Request, CmdFileVariable } from "../../models";

export const FETCH_PLAN_INDEXES = 'FETCH_PLAN_INDEXES' as const;
export const OPEN_PLAN = 'OPEN_PLAN' as const;
export const CLOSE_PLAN = 'CLOSE_PLAN' as const;
export const ACTIVATE_PLAN = 'ACTIVATE_PLAN' as const;
export const CMDFILE_VARIABLE_EDIT = 'CMDFILE_VARIABLE_EDIT' as const;
export const SELECT_PLAN_ROW = 'SELECT_PLAN_ROW' as const;
export const EXEC_REQUEST_SUCCESS = 'EXEC_REQUEST_SUCCESS' as const;
export const EXEC_REQUEST_ERROR = 'EXEC_REQUEST_ERROR' as const;
export const EXEC_REQUESTS_START = 'EXEC_REQUESTS_START' as const;
export const EXEC_REQUESTS_END = 'EXEC_REQUESTS_END' as const;
export const SELECTED_COMPONENT_EDIT = 'SELECTED_COMPONENT_EDIT' as const;
export const SELECTED_TARGET_EDIT = 'SELECTED_TARGET_EDIT' as const;
export const SELECTED_COMMAND_EDIT = 'SELECTED_COMMAND_EDIT' as const;
export const SELECTED_COMMAND_COMMIT = 'SELECTED_COMMAND_COMMIT' as const;
export const DELETE_UNPLANNED_COMMAND = 'DELETE_UNPLANNED_COMMAND' as const;
export const MOVE_UP_UNPLANNED_COMMAND = 'MOVE_UP_UNPLANNED_COMMAND' as const;
export const MOVE_DOWN_UNPLANNED_COMMAND = 'MOVE_DOWN_UNPLANNED_COMMAND' as const;
export const FINISH_EDIT_COMMAND_LINE = 'FINISH_EDIT_COMMAND_LINE' as const;
export const CANCEL_EDIT_COMMAND_LINE = 'CANCEL_EDIT_COMMAND_LINE' as const;
export const SET_COMMAND_TYPE = 'SET_COMMAND_TYPE' as const;

export const fetchPlanIndexesAction = (indexes: FileIndex[]) => {
  return {
    type: FETCH_PLAN_INDEXES,
    payload: indexes
  };
};

export const openPlanAction = (id: string, requests: Request[]) => {
  return {
    type: OPEN_PLAN,
    payload: {
      id: id,
      requests: requests
    }
  };
};

export const closePlanAction = (id: string) => {
  return {
    type: CLOSE_PLAN,
    payload: id
  };
}

export const activatePlanAction = (id: string) => {
  return {
    type: ACTIVATE_PLAN,
    payload: id
  };
};

export const cmdFileVariableEditAction = (cmdFileVariables: CmdFileVariable[]) => {
  return {
    type: CMDFILE_VARIABLE_EDIT,
    payload: cmdFileVariables
  }
}

export const selectedPlanRowAction = (row: number) => {
  return {
    type: SELECT_PLAN_ROW,
    payload: row
  }
};

export const execRequestSuccessAction = (row: number) => {
  return {
    type: EXEC_REQUEST_SUCCESS,
    payload: row
  }
};

export const execRequestErrorAction = (row: number) => {
  return {
    type: EXEC_REQUEST_ERROR,
    payload: row
  }
};

export const execRequestsStartAction = () => {
  return {
    type: EXEC_REQUESTS_START
  }
}

export const execRequestsEndAction = () => {
  return {
    type: EXEC_REQUESTS_END
  }
}

export const selectedComponentEditAction = (component: string) => {
  return {
    type: SELECTED_COMPONENT_EDIT,
    payload: component
  }
};

export const selectedTargetEditAction = (target: string) => {
  return {
    type: SELECTED_TARGET_EDIT,
    payload: target
  }
};

export const selectedCommandEditAction = (command: Command) => {
  return {
    type: SELECTED_COMMAND_EDIT,
    payload: command
  }
};

export const selectedCommandCommitAction = () => {
  return {
    type: SELECTED_COMMAND_COMMIT
  }
};

export const deleteUnplannedCommandAction = (row: number) => {
  return {
    type: DELETE_UNPLANNED_COMMAND,
    payload: row
  }
};

export const moveUpUnplannedCommandAction = (row: number) => {
  return {
    type: MOVE_UP_UNPLANNED_COMMAND,
    payload: row
  }
};

export const moveDownUnplannedCommandAction = (row: number) => {
  return {
    type: MOVE_DOWN_UNPLANNED_COMMAND,
    payload: row
  }
};

export const finishEditCommandLineAction = (row: number, CommandFileLine: CommandPlanLine) => {
  return {
    type: FINISH_EDIT_COMMAND_LINE,
    payload: {
      row: row,
      commandFileLine: CommandFileLine
    }
  }
};

export const cancelEditCommandLineAction = (row: number) => {
  return {
    type: CANCEL_EDIT_COMMAND_LINE,
    payload: row
  }
};

export const setCmdTypeAction = (cmdType: string) => {
  return {
    type: SET_COMMAND_TYPE,
    payload: cmdType
  }
};
