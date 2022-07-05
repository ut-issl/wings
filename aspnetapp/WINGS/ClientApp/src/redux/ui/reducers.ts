import * as Actions from './actions';
import initialState from '../store/initialState';

type Actions = 
  | ReturnType<typeof Actions.startLoadingAction>
  | ReturnType<typeof Actions.endLoadingAction>
  | ReturnType<typeof Actions.openErrorDialogAction>
  | ReturnType<typeof Actions.closeErrorDialogAction>
;

export const UIReducer = (state = initialState.ui, action: Actions) => {
  switch (action.type) {
    case Actions.START_LOADING:
      return {
        ...state,
        isLoading: true
      };
    
    case Actions.END_LOADING:
      return {
        ...state,
        isLoading: false
      };
    
    case Actions.OPEN_ERROR_DIALOG:
      return {
        ...state,
        errorDialog: {
          open: true,
          message: action.payload
        }
      };

    case Actions.CLOSE_ERROR_DIALOG:
      return {
        ...state,
        errorDialog: {
          open: false,
          message: ""
        }
      };

    default:
      return state;
  }
}