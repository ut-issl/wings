import * as Actions from './actions';
import * as OperationActions from '../operations/actions';
import initialState from '../store/initialState';
import { CommandPlanLine } from '../../models';
import { UNPLANNED_ID } from '../../constants';

type Actions = 
  | ReturnType<typeof Actions.fetchPlanIndexesAction>
  | ReturnType<typeof Actions.openPlanAction>
  | ReturnType<typeof Actions.closePlanAction>
  | ReturnType<typeof Actions.activatePlanAction>
  | ReturnType<typeof Actions.cmdFileVariableEditAction>
  | ReturnType<typeof Actions.selectedPlanRowAction>
  | ReturnType<typeof Actions.execRequestSuccessAction>
  | ReturnType<typeof Actions.execRequestErrorAction>
  | ReturnType<typeof Actions.execRequestsStartAction>
  | ReturnType<typeof Actions.execRequestsEndAction>
  | ReturnType<typeof Actions.selectedComponentEditAction>
  | ReturnType<typeof Actions.selectedTargetEditAction>
  | ReturnType<typeof Actions.selectedCommandEditAction>
  | ReturnType<typeof Actions.selectedCommandCommitAction>
  | ReturnType<typeof Actions.deleteUnplannedCommandAction>
  | ReturnType<typeof Actions.moveUpUnplannedCommandAction>
  | ReturnType<typeof Actions.moveDownUnplannedCommandAction>
  | ReturnType<typeof Actions.finishEditCommandLineAction>
  | ReturnType<typeof Actions.cancelEditCommandLineAction>
  | ReturnType<typeof Actions.setCmdTypeAction>
  | ReturnType<typeof OperationActions.leaveOperationAction>
;

export const PlansReducer = (state = initialState.plans, action: Actions) => {
  switch (action.type) {
    case Actions.FETCH_PLAN_INDEXES: {
      return {
        ...state,
        allIndexes: [...state.allIndexes, ...action.payload]
      };
    }
    
    case Actions.OPEN_PLAN: {
      const id = action.payload.id;
      const openedIds = state.openedIds;
      let newOpenedIds = openedIds;
      if (!openedIds.includes(id)) {
        newOpenedIds = [...openedIds, id];
      }
      const content = action.payload.requests.map(
        request => ({
          status: {
            success: false,
            error: false
          },
          request: request,
          edit: {
            status: false,
            text: ""
          }
        } as CommandPlanLine)
      )
      return {
        ...state,
        openedIds: newOpenedIds,
        activeId: id,
        selectedRow: -1,
        contents: {
          ...state.contents,
          [id]: content
        }
      }
    }

    case Actions.CLOSE_PLAN: {
      const closeId = action.payload;
      const newOpenedIds = state.openedIds.filter(id => id !== closeId);
      const newActiveId = state.activeId === closeId ? initialState.plans.activeId : state.activeId;
      const {[closeId]: closeContent, ...newContents} = state.contents;
      return {
        ...state,
        openedIds: newOpenedIds,
        activeId: newActiveId,
        contents: newContents
      };
    }
    
    case Actions.ACTIVATE_PLAN: {
      const id = action.payload;
      const newActiveId = state.openedIds.includes(id) ? id : state.activeId;
      return {
        ...state,
        activeId: newActiveId,
        selectedRow: -1
      }
    }
      
    case Actions.CMDFILE_VARIABLE_EDIT: {
      return {
        ...state,
        cmdFileVariables: action.payload
      }
    }

    case Actions.SELECT_PLAN_ROW: {
      return {
        ...state,
        selectedRow: action.payload
      };
    }
    
    case Actions.EXEC_REQUEST_SUCCESS: {
      const row = action.payload;
      const activeId = state.activeId;
      return {
        ...state,
        contents: {
          ...state.contents,
          [activeId]: [
            ...state.contents[activeId].slice(0,row),
            {
              ...state.contents[activeId][row],
              status: {
                success: true,
                error: false
              }
            },
            ...state.contents[activeId].slice(row+1)
          ]
        }
      }
    }

    case Actions.EXEC_REQUEST_ERROR: {
      const row = action.payload;
      const activeId = state.activeId;
      return {
        ...state,
        contents: {
          ...state.contents,
          [activeId]: [
            ...state.contents[activeId].slice(0,row),
            {
              ...state.contents[activeId][row],
              status: {
                success: false,
                error: true
              }
            },
            ...state.contents[activeId].slice(row+1)
          ]
        }
      }
    }

    case Actions.EXEC_REQUESTS_START: {
      return {
        ...state,
        inExecution: true
      }
    }

    case Actions.EXEC_REQUESTS_END: {
      return {
        ...state,
        inExecution: false
      }
    }

    case Actions.SELECTED_COMPONENT_EDIT: {
      return {
        ...state,
        selectedCommand: {
          component: action.payload,
          target: state.selectedCommand.target,
          command: initialState.plans.selectedCommand.command
        }
      };
    }

    case Actions.SELECTED_TARGET_EDIT: {
      return {
        ...state,
        selectedCommand: {
          component: state.selectedCommand.component,
          target: action.payload,
          command: initialState.plans.selectedCommand.command
        }
      };
    }

    case Actions.SELECTED_COMMAND_EDIT: {
      return {
        ...state,
        selectedCommand: {
          ...state.selectedCommand,
          command: action.payload
        }
      };
    }

    case Actions.SELECTED_COMMAND_COMMIT: {
      const line: CommandPlanLine = {
        status: {
          success: false,
          error: false
        },
        request: {
          type: "command",
          method: null,
          body: state.selectedCommand.command,
          inlineComment: null,
          stopFlag: true,
          syntaxError: false,
          errorMessage: null
        }
      }
      
      let newContent: CommandPlanLine[];
      let newSelctedRow = state.selectedRow;
      if (state.activeId === UNPLANNED_ID && state.selectedRow !== -1) {
        newContent = [
          ...state.contents[UNPLANNED_ID].slice(0,state.selectedRow+1),
          line,
          ...state.contents[UNPLANNED_ID].slice(state.selectedRow+1)
        ];
        newSelctedRow += 1;
      } else {
        newContent = [...state.contents[UNPLANNED_ID], line];
      }

      return {
        ...state,
        selectedRow: newSelctedRow,
        contents: {
          ...state.contents,
          [UNPLANNED_ID]: newContent
        }
      }
    }

    case Actions.DELETE_UNPLANNED_COMMAND: {
      const row = action.payload;
      return {
        ...state,
        selectedRow: row,
        contents: {
          ...state.contents,
          [UNPLANNED_ID]: [
            ...state.contents[UNPLANNED_ID].slice(0,row),
            ...state.contents[UNPLANNED_ID].slice(row+1)
          ]
        }
      }
    }

    case Actions.MOVE_UP_UNPLANNED_COMMAND: {
      const row = action.payload;
      if (row==0){
        return state;
      }
      else{
        return {
          ...state,
          selectedRow: row,
          contents: {
            ...state.contents,
            [UNPLANNED_ID]: [
              ...state.contents[UNPLANNED_ID].slice(0,row-1),
              ...state.contents[UNPLANNED_ID].slice(row,row+1),
              ...state.contents[UNPLANNED_ID].slice(row-1,row),
              ...state.contents[UNPLANNED_ID].slice(row+1)
            ]
          }
        }
      }
    }

    case Actions.MOVE_DOWN_UNPLANNED_COMMAND: {
      const row = action.payload;
      if (row==-1){
        return state;
      }
      else{
        return {
          ...state,
          selectedRow: row,
          contents: {
            ...state.contents,
            [UNPLANNED_ID]: [
              ...state.contents[UNPLANNED_ID].slice(0,row),
              ...state.contents[UNPLANNED_ID].slice(row+1,row+2),
              ...state.contents[UNPLANNED_ID].slice(row,row+1),
              ...state.contents[UNPLANNED_ID].slice(row+2)
            ]
          }
        }
      }
    }

    case Actions.FINISH_EDIT_COMMAND_LINE: {
      const activeId = state.activeId;
      const row = action.payload.row;
      const commandFileLine = action.payload.commandFileLine;
      return {
        ...state,
        contents: {
          ...state.contents,
          [activeId]: [
            ...state.contents[activeId].slice(0,row),
            {
              ...state.contents[activeId][row],
              request: commandFileLine
            },
            ...state.contents[activeId].slice(row+1)
          ]
        }
      }
    }

    case Actions.CANCEL_EDIT_COMMAND_LINE: {
      const row = action.payload;
      const activeId = state.activeId;
      return {
        ...state,
        contents: {
          ...state.contents,
          [activeId]: [
            ...state.contents[activeId].slice(0,row),
            {
              ...state.contents[activeId][row],
              edit: {
                status: true,
                text: ""
              }
            },
            ...state.contents[activeId].slice(row+1)
          ]
        }
      }
    }
      
    case Actions.SET_COMMAND_TYPE: {
      return {
        ...state,
        cmdType: action.payload
      }
    }
      
    case OperationActions.LEAVE_OPERATION: {
      return initialState.plans;
    }
  
    default:
      return state;
  }
};
