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
        targets.forEach(target => {
          if (!(state.targets.includes(target))) state.targets.push(target);
        })
        const components = Array.from(new Set(commands.map(command => command.component)));
        components.forEach(component => {
          if (!(state.components.includes(component))) state.components.push(component);
        })
        state.list  = commands;
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
