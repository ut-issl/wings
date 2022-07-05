import { Command, CommandFileLineLogs } from "../../models";

export const FETCH_COMMANDS = 'FETCH_COMMANDS' as const;
export const UPDATE_COMMAND_LOG = 'UPDATE_COMMAND_LOG' as const; 

export const fetchCommandsAction = (commands: Command[]) => {
  return {
    type: FETCH_COMMANDS,
    payload: commands
  };
};

export const updateCommandLogAction = (commandLog: CommandFileLineLogs[]) => {
  return {
    type: UPDATE_COMMAND_LOG,
    payload: commandLog
  };
};
