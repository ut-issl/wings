import { RootState } from './RootState';
import { UNPLANNED_ID, TARGET_ALL, COMPONENT_ALL } from '../../constants';

const initialState: RootState = {
  ui: {
    isLoading: false,
    errorDialog: {
      open: false,
      message: ""
    }
  },
  operation: {
    id: "",
    pathNumber: "",
    comment: "",
    isRunning: false,
    isTmtcConncted: false,
    fileLocation: "",
    tmtcTarget: null,
    operatorId: null,
    operator: {
      id: "",
      userName: "",
      role: ""
    },
    componentId: "",
    component: {
      id: "",
      name: "",
      tcPacketKey: "",
      tmPacketKey: "",
      localDirPath: ""
    },
    createdAt: "",
    satelliteId: null,
    planId: null
  },
  cmds: {
    list: [],
    targets: [TARGET_ALL],
    components: [COMPONENT_ALL],
    logs: []
  },
  tlms: {
    tlmColor: {
      red: [],
      green: [],
      blue: []
    },
    latest: {},
    history: {}
  },
  plans: {
    allIndexes: [{
      id: UNPLANNED_ID,
      fileId: "",
      name: "Unplanned Commands",
      filePath: "",
      cmdFileInfoIndex: ""
    }],
    cmdFileVariables: [],
    cmdType: "Type-B",
    openedIds: [UNPLANNED_ID],
    activeId: UNPLANNED_ID,
    selectedRow: -1,
    contents: {
      [UNPLANNED_ID]: []
    },
    selectedCommand: {
      component: COMPONENT_ALL,
      target: TARGET_ALL,
      command: {
        component: "",
        execType: "RT",
        execTimeInt: 0,
        execTimeDouble: 0,
        execTimeStr: "",
        name: "",
        code: "",
        target: "",
        params: [],
        isDanger: false,
        isViaMobc: false,
        isRestricted: false,
        description: ""
      }
    },
    inExecution: false
  },
  views: {
    currentView:{
      allIndexes: [],
      blocks: Array(4).fill({
        tabs: [],
        activeTab: 0
      }),
      contents: {}
    },
    tempStoredView:{
      allIndexes: [],
      blocks: Array(4).fill({
        tabs: [],
        activeTab: 0
      }),
      contents: {}
    },
    layoutList: []
  }
};

export default initialState;
