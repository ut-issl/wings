import { createAction } from "@reduxjs/toolkit";
import { Operation, TlmCmdConfigurationInfo } from "../../models";

export const joinOperationAction = createAction<Operation>('operations/join');
export const leaveOperationAction = createAction('operations/leave');
export const fetchTlmCmdConfigAction = createAction<TlmCmdConfigurationInfo[]>('operations/fetchTlmCmdConfig');