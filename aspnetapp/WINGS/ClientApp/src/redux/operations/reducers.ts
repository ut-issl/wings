import * as Actions from './actions';
import initialState from '../store/initialState';

type Actions = 
  | ReturnType<typeof Actions.joinOperationAction>
  | ReturnType<typeof Actions.leaveOperationAction>
  | ReturnType<typeof Actions.fetchTlmCmdConfigAction>
;

export const OperationsReducer = (state = initialState.operation, action: Actions) => {
  switch (action.type) {
    case Actions.JOIN_OPERATION:
      return action.payload;

    case Actions.LEAVE_OPERATION:
      return initialState.operation;
    
      case Actions.TLM_CMD_CONFIG: {
        const tlmCmdConfig = action.payload;
        return {
          ...state,
          tlmCmdConfig: tlmCmdConfig
        };
      }

    default:
      return state;
  }
}