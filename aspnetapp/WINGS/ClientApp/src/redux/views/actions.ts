import { createAction } from "@reduxjs/toolkit";
import { TelemetryViewIndex, Layout, TelemetryView } from "../../models";

export const fetchViewIndexesAction = createAction<TelemetryViewIndex[]>('views/fetchViewIndexes');
export const fetchLayoutsAction = createAction<Layout[]>('views/fetchLayouts');
export const openViewAction = createAction<{block: number, id: string}>('views/openView');
export const closeViewAction = createAction<{block: number, tab: number}>('views/closeView');
export const activateViewAction = createAction<{block: number, tab: number}>('views/activateView');
export const tempStoreViewAction = createAction<TelemetryView>('views/tempStoreView');
export const backViewAction = createAction('views/backView');
export const commitSelectedLayoutAction = createAction<number>('views/commitSelectedLayout');
export const selectTelemetryAction = createAction<{block: number, tlmName:string[]}>('views/selectTelemetry');
export const setTelemetryTypePacketAction = createAction<{block: number, dataType:string}>('views/setTelemetryTypePacket'); 
export const setTelemetryTypeGraphAction = createAction<{block: number, dataType:string, dataLength: string, ylabelMin:string, ylabelMax:string}>('views/setTelemetryTypeGraph');
