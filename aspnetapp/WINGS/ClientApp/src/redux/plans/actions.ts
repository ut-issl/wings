import { Command, FileIndex, Request } from "../../models";

export const FETCH_PLAN_INDEXES = 'FETCH_PLAN_INDEXES' as const;
export const OPEN_PLAN = 'OPEN_PLAN' as const;
export const CLOSE_PLAN = 'CLOSE_PLAN' as const;
export const ACTIVATE_PLAN = 'ACTIVATE_PLAN' as const;
export const SELECT_PLAN_ROW = 'SELECT_PLAN_ROW' as const;
export const EXEC_REQUEST_SUCCESS = 'EXEC_REQUEST_SUCCESS' as const;
export const EXEC_REQUEST_ERROR = 'EXEC_REQUEST_ERROR' as const;
export const EXEC_REQUESTS_START = 'EXEC_REQUESTS_START' as const;
export const EXEC_REQUESTS_END = 'EXEC_REQUESTS_END' as const;
export const SELECTED_COMPONENT_EDIT = 'SELECTED_COMPONENT_EDIT' as const;
export const SELECTED_TARGET_EDIT = 'SELECTED_TARGET_EDIT' as const;
export const SELECTED_COMMAND_EDIT = 'SELECTED_COMMAND_EDIT' as const;
export const SELECTED_COMMAND_COMMIT = 'SELECTED_COMMAND_COMMIT' as const;

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
