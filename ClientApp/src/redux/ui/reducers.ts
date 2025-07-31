import * as Actions from './actions';
import initialState from '../store/initialState';
import { createSlice } from '@reduxjs/toolkit';

export const uiSlice = createSlice({
  name: 'ui',
  initialState: initialState.ui,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(Actions.startLoadingAction, (state) => {
        state.isLoading = true;
      })
      .addCase(Actions.endLoadingAction, (state) => {
        state.isLoading = false;
      })
      .addCase(Actions.openErrorDialogAction, (state, action) => {
        state.errorDialog.open = true;
        state.errorDialog.message = action.payload;
      })
      .addCase(Actions.closeErrorDialogAction, (state) => {
        state.errorDialog.open = false;
        state.errorDialog.message = "";
      })
  }
})

export default uiSlice.reducer;
