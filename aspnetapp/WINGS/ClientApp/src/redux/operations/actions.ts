import { Operation, TlmCmdConfigurationInfo } from "../../models";

export const JOIN_OPERATION = 'JOIN_OPERATION' as const;
export const LEAVE_OPERATION = 'LEAVE_OPERATION' as const;
export const TLM_CMD_CONFIG = 'TLM_CMD_CONFIG' as const;

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

export const fetchTlmCmdConfigAction = (tlmCmdConfig: TlmCmdConfigurationInfo[]) => {
  return {
    type: TLM_CMD_CONFIG,
    payload: tlmCmdConfig
  };
};