export const START_LOADING = 'START_LOADING' as const;
export const END_LOADING = 'END_LOADING' as const;
export const OPEN_ERROR_DIALOG = 'OPEN_ERROR_DIALOG' as const;
export const CLOSE_ERROR_DIALOG = 'CLOSE_ERROR_DIALOG' as const;

export const startLoadingAction = () => {
  return {
    type: START_LOADING
  };
};

export const endLoadingAction = () => {
  return {
    type: END_LOADING
  };
};

export const openErrorDialogAction = (message: string) => {
  return {
    type: OPEN_ERROR_DIALOG,
    payload: message
  };
};

export const closeErrorDialogAction = () => {
  return {
    type: CLOSE_ERROR_DIALOG
  };
};
