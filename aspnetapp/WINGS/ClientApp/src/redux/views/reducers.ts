import * as Actions from './actions';
import * as OperationActions from '../operations/actions';
import initialState from '../store/initialState';

type Actions =
  | ReturnType<typeof Actions.fetchViewIndexesAction>
  | ReturnType<typeof Actions.fetchLayoutsAction>
  | ReturnType<typeof Actions.openViewAction>
  | ReturnType<typeof Actions.closeViewAction>
  | ReturnType<typeof Actions.activateViewAction>
  | ReturnType<typeof Actions.tempStoreViewAction>
  | ReturnType<typeof Actions.backViewAction>
  | ReturnType<typeof Actions.selectedLayoutCommitAction>
  | ReturnType<typeof Actions.selectTelemetryAction>
  | ReturnType<typeof Actions.setTelemetryTypePacketAction>
  | ReturnType<typeof Actions.setTelemetryTypeGraphAction>
  | ReturnType<typeof OperationActions.leaveOperationAction>
;

export const ViewsReducer = (state = initialState.views, action: Actions) => {
  switch (action.type) {
    case Actions.FETCH_VIEW_INDEXES: {
      return {
        ...state,
        currentView: {
          ...state.currentView,
          allIndexes: action.payload
        }
      }
    }

    case Actions.OPEN_VIEW: {
      const { block, id, content } = action.payload;
      const index = state.currentView.allIndexes.find(index => index.id === id);
      return {
        ...state,
        currentView: {
          ...state.currentView,
          blocks: [
            ...state.currentView.blocks.slice(0,block),
            {
              tabs: [...state.currentView.blocks[block].tabs, index],
              activeTab: state.currentView.blocks[block].tabs.length
            },
            ...state.currentView.blocks.slice(block+1)
          ],
          contents: {
            ...state.currentView.contents,
            [id]: content
          }
        }
      };
    }

    case Actions.CLOSE_VIEW: {
      const { block, tab } = action.payload;
      return {
        ...state,
        currentView: {
          ...state.currentView,
          blocks: [
            ...state.currentView.blocks.slice(0,block),
            {
              ...state.currentView.blocks[block],
              tabs: [
                ...state.currentView.blocks[block].tabs.slice(0,tab),
                ...state.currentView.blocks[block].tabs.slice(tab+1)
              ]
            },
            ...state.currentView.blocks.slice(block+1)
          ]
        }
      };
    }

    case Actions.ACTIVATE_VIEW: {
      const { block, tab } = action.payload;
      return {
        ...state,
        currentView: {
          ...state.currentView,
          blocks: [
            ...state.currentView.blocks.slice(0,block),
            {
              ...state.currentView.blocks[block],
              activeTab: tab
            },
            ...state.currentView.blocks.slice(block+1)
          ]
        }
      };
    }
    
    case Actions.TEMP_STORE_VIEW: {
      const tempLayout = action.payload;
      return {
        ...state,
        tempStoredView: {
          allIndexes: tempLayout.allIndexes,
          blocks: tempLayout.blocks,
          contents: tempLayout.contents
        }
      }
    }

    case Actions.BACK_VIEW: {
      return {
        ...state,
        currentView: {
          allIndexes: state.tempStoredView.allIndexes,
          blocks: state.tempStoredView.blocks,
          contents: state.tempStoredView.contents
        }
      }
    }


    case Actions.SELECTED_LAYOUT_COMMIT: {
      const index = action.payload;
      return {
        ...state,
        currentView: {
          allIndexes: state.layoutList[index].telemetryView.allIndexes,
          blocks: state.layoutList[index].telemetryView.blocks,
          contents: state.layoutList[index].telemetryView.contents
        }
      }
    }

    case Actions.SELECT_TELEMETRY: {
      const { block, tlmname } = action.payload;
      return {
        ...state,
        currentView: {
          ...state.currentView,
          blocks: [
            ...state.currentView.blocks.slice(0, block),
            {
              ...state.currentView.blocks[block],
              tabs: [...state.currentView.blocks[block].tabs.slice(0, state.currentView.blocks[block].activeTab),
                {
                  ...state.currentView.blocks[block].tabs[state.currentView.blocks[block].activeTab],
                  selectedTelemetries: tlmname
                },
                ...state.currentView.blocks[block].tabs.slice(state.currentView.blocks[block].activeTab+1)]
            },
            ...state.currentView.blocks.slice(block + 1)
          ]
      }
      };
    }

    case Actions.SET_TELEMETRY_TYPE_PACKET: {
      const { block, dataType, packetType } = action.payload;
      return {
        ...state,
        currentView:{
          ...state.currentView,
          blocks: [
            ...state.currentView.blocks.slice(0, block),
            {
              ...state.currentView.blocks[block],
              tabs: [...state.currentView.blocks[block].tabs.slice(0, state.currentView.blocks[block].activeTab),
                {
                  ...state.currentView.blocks[block].tabs[state.currentView.blocks[block].activeTab],
                  dataType: dataType,
                  packetType: packetType
                },
                ...state.currentView.blocks[block].tabs.slice(state.currentView.blocks[block].activeTab+1)]
            },
            ...state.currentView.blocks.slice(block + 1)
          ]
        }
      };
    }

    case Actions.SET_TELEMETRY_TYPE_GRAPH: {
      const { block, dataType, dataLength, ylabelMin, ylabelMax } = action.payload;
      return {
        ...state,
        currentView:{
          ...state.currentView,
          blocks: [
            ...state.currentView.blocks.slice(0, block),
            {
              ...state.currentView.blocks[block],
              tabs: [...state.currentView.blocks[block].tabs.slice(0, state.currentView.blocks[block].activeTab),
                {
                  ...state.currentView.blocks[block].tabs[state.currentView.blocks[block].activeTab],
                  dataType: dataType,
                  dataLength: dataLength,
                  ylabelMin: ylabelMin,
                  ylabelMax: ylabelMax
                },
                ...state.currentView.blocks[block].tabs.slice(state.currentView.blocks[block].activeTab+1)]
            },
            ...state.currentView.blocks.slice(block + 1)
          ]
        }
      };
    }

    case OperationActions.LEAVE_OPERATION: {
      return initialState.views;
    }

    case Actions.FETCH_LAYOUTS: {
      const layouts = action.payload;
      return {
        ...state,
        layoutList: layouts
      };
    }

    default:
      return state;
  }
}
