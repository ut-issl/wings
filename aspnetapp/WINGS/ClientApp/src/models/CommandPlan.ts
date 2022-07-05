import { Command } from './Command';
import { FileIndex } from './FileIndex';

export type CommandPlanIndex = FileIndex & {
  fileId: string,
  cmdFileInfoIndex: string
}

export type Request = {
  type: string,
  method: string | null,
  body: string | Command | any,
  inlineComment: string | null,
  stopFlag: boolean,
  syntaxError: boolean,
  errorMessage: string | null
}

export type RequestStatus = {
  success: boolean,
  error: boolean
}

export type CommandPlanLine = {
  status: RequestStatus,
  request: Request
}

export type CommandPlanState = {
  allIndexes: CommandPlanIndex[],
  openedIds: string[],
  activeId: string,
  selectedRow: number,
  contents : {
    [id: string] : CommandPlanLine[]
  },
  selectedCommand: {
    component: string,
    target: string,
    command: Command
  },
  inExecution: boolean
}
