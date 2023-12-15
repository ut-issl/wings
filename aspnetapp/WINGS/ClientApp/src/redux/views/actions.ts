import { TelemetryViewIndex, Layout, TelemetryView } from "../../models";

export const FETCH_VIEW_INDEXES = 'FETCH_VIEW_INDEXES' as const;
export const FETCH_LAYOUTS = 'FETCH_LAYOUTS' as const;
export const OPEN_VIEW = 'OPEN_VIEW' as const;
export const CLOSE_VIEW = 'CLOSE_VIEW' as const;
export const ACTIVATE_VIEW = 'ACTIVATE_VIEW' as const;
export const TEMP_STORE_VIEW = 'TEMP_STORE_VIEW' as const;
export const BACK_VIEW = 'BACK_VIEW' as const;
export const SELECTED_LAYOUT_COMMIT = 'SELECTED_LAYOUT_COMMIT' as const;
export const SELECT_TELEMETRY = 'SELECT_TELEMETRY' as const;
export const SET_TELEMETRY_TYPE_PACKET = 'SET_TELEMETRY_TYPE_PACKET' as const;
export const SET_TELEMETRY_TYPE_GRAPH = 'SET_TELEMETRY_TYPE_GRAPH' as const;

export const fetchViewIndexesAction = (indexes: TelemetryViewIndex[]) => {
  return {
    type: FETCH_VIEW_INDEXES,
    payload: indexes
  };
};

export const fetchLayoutsAction = (layouts: Layout[]) => {
  return {
    type: FETCH_LAYOUTS,
    payload: layouts
  };
};

export const openViewAction = (block: number, id: string, content: any) => {
  return {
    type: OPEN_VIEW,
    payload: {
      block: block,
      id: id,
      content: content
    }
  };
};

export const closeViewAction = (block: number, tab: number) => {
  return {
    type: CLOSE_VIEW,
    payload: {
      block: block,
      tab: tab
    }
  };
};

export const activateViewAction = (block: number, tab: number) => {
  return {
    type: ACTIVATE_VIEW,
    payload: {
      block: block,
      tab: tab
    }
  }
};

export const tempStoreViewAction = (telemetryView: TelemetryView) => {
  return {
    type: TEMP_STORE_VIEW,
    payload: telemetryView
  }
};

export const backViewAction = () => {
  return {
    type: BACK_VIEW,
  }
};

export const selectedLayoutCommitAction = (index: number) => {
  return {
    type: SELECTED_LAYOUT_COMMIT,
    payload: index
  }
};

export const selectTelemetryAction = (block: number, tlmname:string[]) => {
  return {
    type: SELECT_TELEMETRY,
    payload: {
      block: block,
      tlmname: tlmname
    }
  }
};

export const setTelemetryTypePacketAction = (block: number, dataType:string, packetType:string|undefined) => {
  return {
    type: SET_TELEMETRY_TYPE_PACKET,
    payload: {
      block: block,
      dataType: dataType,
      packetType: packetType
    }
  }
};

export const setTelemetryTypeGraphAction = (block: number, dataType:string, dataLength:string, ylabelMin:string, ylabelMax:string) => {
  return {
    type: SET_TELEMETRY_TYPE_GRAPH,
    payload: {
      block: block,
      dataType: dataType,
      dataLength: dataLength,
      ylabelMin: ylabelMin,
      ylabelMax: ylabelMax,
    }
  }
};