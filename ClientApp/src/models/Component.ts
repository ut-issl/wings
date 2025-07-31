export type ComponentJson = {
  data: Component[],
  message: string
}

export type Component = {
  id: string,
  name: string,
  tcPacketKey: string,
  tmPacketKey: string,
  localDirPath: string
}