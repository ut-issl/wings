import { Operation, CommandState, TelemetryState, CommandPlanState, UIState, TelemetryViewState, Layout } from "../../models";

export type RootState = {
  ui: UIState,
  operation: Operation,
  cmds: CommandState,
  tlms: TelemetryState,
  plans: CommandPlanState,
  views: TelemetryViewState
};
