import { Operation } from "../../models";

export const JOIN_OPERATION = 'JOIN_OPERATION' as const;
export const LEAVE_OPERATION = 'LEAVE_OPERATION' as const;

export const joinOperationAction = (operation: Operation) => {
  return {
    type: JOIN_OPERATION,
    payload: operation
  };
};

export const leaveOperationAction = () => {
  return {
    type: LEAVE_OPERATION
  };
};
