import { Component } from './Component';

export type TlmCmdConfigurationInfo = {
  tlmApid: string,
  cmdApid: string,
  compoName: string
};

export type Operation = {
  id: string,
  pathNumber: string,
  comment: string,
  isRunning: boolean,
  isTmtcConncted: boolean,
  fileLocation: string,
  tmtcTarget: string | null,
  operatorId: string | null,
  operator: {
    id: string,
    userName: string,
    role: string
  },
  componentId: string,
  component: Component,
  createdAt: string,
  satelliteId: string | null,
  planId: string | null,
  tlmCmdConfig: TlmCmdConfigurationInfo[]
}
