export type CommandParam = {
  name: string | null,
  type: string,
  value: string | null,
  unit: string | null,
  description: string |  null
}

export type CommandJson = {
  data: Command,
  message: string
}

export type CommandsJson = {
  data: Command[],
  message: string
}

export type Command = {
  component: string,
  execType: string,
  execTimeInt: number,
  execTimeDouble: number,
  execTimeStr: string,
  name: string,
  code: string,
  target: string,
  params: CommandParam[],
  isDanger: boolean,
  isViaMobc: boolean,
  isRestricted: boolean,
  description: string
}

export type CommandController = {
  fileName: string,
  time: number,
  timeoutsec: string | number
  variable: string,
  compare: string,
  value: string
  equation: string,
  statement: string,
  equal: string,
}

export type CommandState = {
  list: Command[],
  targets: string[],
  components: string[],
  logs: CommandFileLineLogs[]
}

export type CommandFileLineLogs = {
  time: string,
  commander: string,
  content: string,
  status: string
}

export type CommandLogsJson = {
  data: CommandFileLineLogs[],
  message: string
}
