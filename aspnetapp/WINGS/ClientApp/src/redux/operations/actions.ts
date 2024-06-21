import { createAction } from "@reduxjs/toolkit";
import { Operation, TlmCmdConfigurationInfo } from "../../models";

export const joinOperationAction = createAction<Operation>('operation/join');
export const leaveOperationAction = createAction('operation/leave');
export const fetchTlmCmdConfigAction = createAction<TlmCmdConfigurationInfo[]>('operation/fetchTlmCmdConfig');