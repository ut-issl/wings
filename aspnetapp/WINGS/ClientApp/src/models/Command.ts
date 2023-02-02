export type CommandParam = {
  name: string | null,
  type: string,
  value: string | null,
  unit: string | null,
  description: string |  null
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
