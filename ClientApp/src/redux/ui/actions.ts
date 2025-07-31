import { createAction } from "@reduxjs/toolkit";

export const startLoadingAction = createAction('ui/startLoading');
export const endLoadingAction = createAction('ui/endLoading');
export const openErrorDialogAction = createAction<string>('ui/openErrorDialog');
export const closeErrorDialogAction = createAction('ui/closeErrorDialog');
