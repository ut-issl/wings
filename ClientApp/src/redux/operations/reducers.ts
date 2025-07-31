import * as Actions from './actions';
import initialState from '../store/initialState';
import { createSlice } from '@reduxjs/toolkit';
import { Operation } from '../../models';

export const operationsSlice = createSlice({
  name: 'operations',
  initialState: initialState.operation,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(Actions.fetchTlmCmdConfigAction, (state, action) => {
        state.tlmCmdConfig = action.payload;
      })
      .addCase(Actions.joinOperationAction, (state, action) => {
        const operation = action.payload;
        state.id = operation.id;
        state.pathNumber = operation.pathNumber;
        state.comment = operation.comment;
        state.isRunning = operation.isRunning;
        state.isTmtcConncted = operation.isTmtcConncted;
        state.fileLocation= operation.fileLocation;
        state.operatorId = operation.operatorId;
        state.operator = operation.operator;
        state.componentId = operation.componentId;
        state.component = operation.component;
        state.createdAt = operation.createdAt;
        state.satelliteId = operation.satelliteId;
        state.planId = operation.planId;
        state.tlmCmdConfig = operation.tlmCmdConfig;
      })
      .addCase(Actions.leaveOperationAction, (state) => {
        const operation = initialState.operation;
        state.id = operation.id;
        state.pathNumber = operation.pathNumber;
        state.comment = operation.comment;
        state.isRunning = operation.isRunning;
        state.isTmtcConncted = operation.isTmtcConncted;
        state.fileLocation= operation.fileLocation;
        state.operatorId = operation.operatorId;
        state.operator = operation.operator;
        state.componentId = operation.componentId;
        state.component = operation.component;
        state.createdAt = operation.createdAt;
        state.satelliteId = operation.satelliteId;
        state.planId = operation.planId;
        state.tlmCmdConfig = operation.tlmCmdConfig;
      })
  }
})

export default operationsSlice.reducer;
