import * as Actions from './actions';
import * as OperationActions from '../operations/actions';
import initialState from '../store/initialState';
import { CommandPlanIndex, CommandPlanLine } from '../../models';
import { UNPLANNED_ID } from '../../constants';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export const plansSlice = createSlice({
  name: 'plans',
  initialState: initialState.plans,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(Actions.fetchPlanIndexesAction, (state, action) => {
        state.allIndexes = [...state.allIndexes, ...action.payload];
      })
      .addCase(Actions.openPlanAction, (state, action) => {
        const {id, requests} = action.payload;
        if (!state.openedIds.includes(id)) {
          state.openedIds.push(id);
        }
        const content = requests.map((request) => ({
            status: { success: false, error: false },
            request,
            edit: { status: false, text: '' }
        } as CommandPlanLine))
        state.activeId = id;
        state.contents[id] = content;
        state.selectedRow = -1;
      })
      .addCase(Actions.closePlanAction, (state, action) => {
        const closeId = action.payload;
        state.openedIds = state.openedIds.filter((id) => id !== closeId);
        if (state.activeId === closeId) {
          state.activeId = initialState.plans.activeId;
        }
        delete state.contents[closeId];
      })
      .addCase(Actions.activatePlanAction, (state, action) => {
        const id = action.payload;
        if (state.openedIds.includes(id)) {
          state.activeId = id;
        }
        state.selectedRow = -1;
      })
      .addCase(Actions.editCmdFileVariableAction, (state, action) => {
        state.cmdFileVariables = action.payload;
      })
      .addCase(Actions.selectedPlanRowAction, (state, action) => {
        state.selectedRow = action.payload;
      })
      .addCase(Actions.execRequestSuccessAction, (state, action) => {
        const row = action.payload;
        const activeId = state.activeId;
        state.contents[activeId][row].status = { success: true, error: false };
      })
      .addCase(Actions.execRequestErrorAction, (state, action) => {
        const row = action.payload;
        const activeId = state.activeId;
        state.contents[activeId][row].status = { success: false, error: true };
      })
      .addCase(Actions.execRequestsStartAction, (state) => {
        state.inExecution = true;
      })
      .addCase(Actions.execRequestsEndAction, (state) => {
        state.inExecution = false;
      })
      .addCase(Actions.editSelectedComponentAction, (state, action) => {
        state.selectedCommand.component = action.payload;
        state.selectedCommand.command = initialState.plans.selectedCommand.command;
      })
      .addCase(Actions.editSelectedTargetAction, (state, action) => {
        state.selectedCommand.target = action.payload;
        state.selectedCommand.command = initialState.plans.selectedCommand.command;
      })
      .addCase(Actions.editSelectedCommandAction, (state, action) => {
        state.selectedCommand.command = action.payload;
      })
      .addCase(Actions.commitSelectedCommandAction, (state) => {
        const line: CommandPlanLine = {
          status: { success: false, error: false },
          request: {
            type: 'command',
            method: null,
            body: state.selectedCommand.command,
            inlineComment: null,
            stopFlag: true,
            syntaxError: false,
            errorMessage: null
          }
        };
        if (state.activeId === UNPLANNED_ID && state.selectedRow !== -1) {
          state.contents[UNPLANNED_ID].splice(state.selectedRow + 1, 0, line);
          state.selectedRow += 1;
        } else {
          state.contents[UNPLANNED_ID].push(line);
        }
      })
      .addCase(Actions.deleteUnplannedCommandAction, (state, action) => {
        const row = action.payload;
        state.contents[UNPLANNED_ID].splice(row, 1);
        state.selectedRow = row;
      })
      .addCase(Actions.moveUpUnplannedCommandAction, (state, action) => {
        const row = action.payload;
        if (row > 0) {
          const command = state.contents[UNPLANNED_ID].splice(row, 1)[0];
          state.contents[UNPLANNED_ID].splice(row - 1, 0, command);
          state.selectedRow = row - 1;
        }
      })
      .addCase(Actions.moveDownUnplannedCommandAction, (state, action) => {
        const row = action.payload;
        if (row < state.contents[UNPLANNED_ID].length - 1) {
          const command = state.contents[UNPLANNED_ID].splice(row, 1)[0];
          state.contents[UNPLANNED_ID].splice(row + 1, 0, command);
          state.selectedRow = row + 1;
        }
      })
      .addCase(Actions.finishEditCommandLineAction, (state, action) => {
        const { row, commandFileLineRequest } = action.payload;
        state.contents[state.activeId][row].request = commandFileLineRequest;
      })
      .addCase(Actions.setCmdTypeAction, (state, action) => {
        state.cmdType = action.payload;
      })
      .addCase(OperationActions.leaveOperationAction, (state) => {
        state = initialState.plans;
      });
  }
})

export default plansSlice.reducer;
