import * as Actions from './actions';
import * as OperationActions from '../operations/actions';
import initialState from '../store/initialState';
import { createSlice } from '@reduxjs/toolkit';

export const commandsSlice = createSlice({
  name: 'commands',
  initialState: initialState.cmds,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(Actions.fetchCommandsAction, (state, action) => {
        const commands = action.payload;
        const targets = Array.from(new Set(commands.map(command => command.target)));
        const components = Array.from(new Set(commands.map(command => command.component)));
        state.list  = commands;
        state.targets = [...state.targets, ...targets];
        state.components =  [...state.components, ...components];
        state.logs = [];
      })
      .addCase(Actions.updateCommandLogAction, (state, action) => {
        state.logs = action.payload;
      })
      .addCase(OperationActions.leaveOperationAction, (state) => {
        state = initialState.cmds;
      })
  }
})

export default commandsSlice.reducer;
