import { createAction } from "@reduxjs/toolkit";
import { Command, CommandFileLineLogs } from "../../models";

export const fetchCommandsAction = createAction<Command[]>('commands/fetch');
export const updateCommandLogAction = createAction<CommandFileLineLogs[]>('commands/updateLogs');
