import { FileIndex } from "./FileIndex"

export type TelemetryViewIndex = FileIndex & {
  type: "packet" | "character" | "graph" | "",
  selectedTelemetries: string[],
  dataType: string,
  dataLength: string,
  ylabelMin: string,
  ylabelMax: string,
  packetId: string,
  tlmApid: string,
  compoName: string
}

export type ViewBlockInfo = {
  tabs: TelemetryViewIndex[],
  activeTab: number
}

export type TelemetryView = {
  allIndexes: TelemetryViewIndex[],
  blocks: ViewBlockInfo[],
}

export type LayoutJson = {
  data: Layout[],
  message: string
}

export type Layout = {
  telemetryView: TelemetryView,
  id: number,
  name: string
}

export type TelemetryViewState = {
  currentView: TelemetryView,
  tempStoredView: TelemetryView,
  layoutList: Layout[]
}
