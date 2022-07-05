export type Telemetry = {
  telemetryInfo: TelemetryInfo,
  telemetryValue: TelemetryValue
}

export type TelemetryHistory = {
  telemetryInfo: TelemetryInfo,
  telemetryValues: TelemetryValue[]
}

export type TelemetryInfo = {
  name: string,
  type: string,
  octetPos: number,
  bitPos: number,
  bitLen: number,
  convType: string,
  poly: number[],
  status: {
    [value: string]: string
  },
  description: string
}

export type TelemetryValue = {
  time: string,
  value: string,
  rawValue: string,
  TI: string
}

export type TelemetryPacket = {
  packetInfo: {
    id: string,
    name: string,
    isRealtimeData: boolean,
    isRestricted: boolean
  },
  telemetries: Telemetry[]
}

export type TelemetryPacketHistory = {
  packetInfo: {
    id: string,
    name: string,
    isRealtimeData: boolean,
    isRestricted: boolean
  },
  telemetryHistories: TelemetryHistory[]
}

export type TelemetryState = {
  latest: {
    [packetName: string]: Telemetry[]
  },
  history: {
    [packetName: string]: TelemetryHistory[]
  }
}
