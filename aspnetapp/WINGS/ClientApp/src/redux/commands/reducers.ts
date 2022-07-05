import * as Actions from './actions';
import * as OperationActions from '../operations/actions';
import initialState from '../store/initialState';

type Actions = 
  | ReturnType<typeof Actions.fetchCommandsAction>
  | ReturnType<typeof Actions.updateCommandLogAction>
  | ReturnType<typeof OperationActions.leaveOperationAction>
;

export const CommandsReducer = (state = initialState.cmds, action: Actions) => {
  switch (action.type) {
    case Actions.FETCH_COMMANDS:
      const commands = action.payload;
      const targets = Array.from(new Set(commands.map(command => command.target)));
      const components = Array.from(new Set(commands.map(command => command.component)));
      return {
        list: commands,
        targets: [...state.targets, ...targets],
        components: [...state.components, ...components],
        logs: []
      }
    
    case Actions.UPDATE_COMMAND_LOG:
      const cmdFileLineLogs = action.payload;
      return {
        ...state,
        logs: cmdFileLineLogs
      };
    
    case OperationActions.LEAVE_OPERATION:
      return initialState.cmds;

    default:
      return state;
  }
};
