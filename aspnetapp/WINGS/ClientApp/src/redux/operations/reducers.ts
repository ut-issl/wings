import * as Actions from './actions';
import initialState from '../store/initialState';
import { createSlice } from '@reduxjs/toolkit';

export const operationsSlice = createSlice({
  name: 'operation',
  initialState: initialState.operation,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(Actions.fetchTlmCmdConfigAction, (state, action) => {
        state.tlmCmdConfig = action.payload;
      })
      .addCase(Actions.joinOperationAction, (state, action) => {
        state = action.payload;
      })
      .addCase(Actions.leaveOperationAction, (state) => {
        state = initialState.operation;
      })
  }
})

export default operationsSlice.reducer;
