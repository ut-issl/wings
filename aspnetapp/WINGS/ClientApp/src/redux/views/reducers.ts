import * as Actions from './actions';
import * as OperationActions from '../operations/actions';
import initialState from '../store/initialState';
import { createSlice } from '@reduxjs/toolkit';

export const viewsSlice = createSlice({
  name: 'views',
  initialState: initialState.views,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(Actions.fetchViewIndexesAction, (state, action) => {
        state.currentView.allIndexes = action.payload;
      })
      .addCase(Actions.fetchLayoutsAction, (state, action) => {
        state.layoutList = action.payload;
      })
      .addCase(Actions.openViewAction, (state, action) => {
        const { block, id } = action.payload;
        const viewBlockInfo = state.currentView.allIndexes.find(index => index.id === id);
        if (viewBlockInfo != undefined) {
          state.currentView.blocks[block].tabs.push(viewBlockInfo);
        }
        state.currentView.blocks[block].activeTab = state.currentView.blocks[block].tabs.length - 1;
      })
      .addCase(Actions.closeViewAction, (state, action) => {
        const { block, tab } = action.payload;
        state.currentView.blocks[block].tabs.splice(tab, 1);
      })
      .addCase(Actions.activateViewAction, (state, action) => {
        const { block, tab } = action.payload;
        state.currentView.blocks[block].activeTab = tab;
      })
      .addCase(Actions.tempStoreViewAction, (state, action) => {
        state.tempStoredView = action.payload;
      })
      .addCase(Actions.backViewAction, (state) => {
        state.currentView = state.tempStoredView;
      })
      .addCase(Actions.commitSelectedLayoutAction, (state, action) => {
        const index = action.payload;
        state.currentView = state.layoutList[index].telemetryView;
      })
      .addCase(Actions.selectTelemetryAction, (state, action) => {
        const { block, tlmName } = action.payload;
        state.currentView.blocks[block].tabs[state.currentView.blocks[block].activeTab].selectedTelemetries = tlmName;
      })
      .addCase(Actions.setTelemetryTypePacketAction, (state, action) => {
        const { block, dataType } = action.payload;
        state.currentView.blocks[block].tabs[state.currentView.blocks[block].activeTab].dataType = dataType;
      })
      .addCase(Actions.setTelemetryTypeGraphAction, (state, action) => {
        const { block, dataType, dataLength, ylabelMin, ylabelMax } = action.payload;
        const tab = state.currentView.blocks[block].tabs[state.currentView.blocks[block].activeTab];
        tab.dataType = dataType;
        tab.dataLength = dataLength;
        tab.ylabelMin = ylabelMin;
        tab.ylabelMax = ylabelMax;
      })
      .addCase(OperationActions.leaveOperationAction, (state) => {
        state = initialState.views;
      });
  }
});

export default viewsSlice.reducer;
