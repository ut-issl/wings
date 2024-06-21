import { createAction } from "@reduxjs/toolkit";
import { Command, CommandPlanLine, Request, CmdFileVariable, CommandPlanIndex } from "../../models";

export const fetchPlanIndexesAction = createAction<CommandPlanIndex[]>('plans/fetchIndexes');
export const openPlanAction = createAction<{id: string, requests: Request[]}>('plans/open');
export const closePlanAction = createAction<string>('plans/close');
export const activatePlanAction = createAction<string>('plans/activate');
export const editCmdFileVariableAction = createAction<CmdFileVariable[]>('plans/EditCmdFileVariable');
export const selectedPlanRowAction = createAction<number>('plans/selectRow');
export const execRequestSuccessAction = createAction<number>('plans/execRequestSuccess');
export const execRequestErrorAction = createAction<number>('plans/execRequestError');
export const execRequestsStartAction = createAction('plans/execRequestsStart');
export const execRequestsEndAction = createAction('plans/execRequestsEnd');
export const editSelectedComponentAction = createAction<string>('plans/editSelectedComponent');
export const editSelectedTargetAction = createAction<string>('plans/editSelectedTarget');
export const editSelectedCommandAction = createAction<Command>('plans/editSelectedCommand');
export const commitSelectedCommandAction = createAction('plans/commitSelectedCommand');
export const deleteUnplannedCommandAction = createAction<number>('plans/deleteUnplannedCommand');
export const moveUpUnplannedCommandAction = createAction<number>('plans/moveUpUnplannedCommand');
export const moveDownUnplannedCommandAction = createAction<number>('plans/moveDownUnplannedCommand');
export const finishEditCommandLineAction = createAction<{row: number, commandFileLineRequest: Request}>('plans/finishEditCommandLine');
export const setCmdTypeAction = createAction<string>('plans/setCmdType');
