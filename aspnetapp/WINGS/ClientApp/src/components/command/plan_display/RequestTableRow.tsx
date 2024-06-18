import React from 'react';
import { Command, CommandPlanLine, Request, RequestStatus } from '../../../models';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import StopIcon from '@mui/icons-material/Stop';
import { ArrowUpward, ArrowDownward, Delete } from '@mui/icons-material';
import { Theme, useTheme } from '@mui/material';
import { deleteUnplannedCommandAction, moveUpUnplannedCommandAction, moveDownUnplannedCommandAction } from '../../../redux/plans/actions';
import { getActivePlanId } from '../../../redux/plans/selectors';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store/RootState';
import { grey } from '@mui/material/colors';

export interface RequestTableRowProps {
  line: CommandPlanLine,
  index: number,
  isSelected: boolean,
  onClick: ((event: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void) | undefined
  onDoubleClick: ((event: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void) | undefined
}

const RequestTableRow = (props: RequestTableRowProps) => {
  const theme: Theme = useTheme();
  const spacer = <span style={{ marginRight: "10px" }}></span>;
  const dispatch = useDispatch();
  const selector = useSelector((state: RootState) => state);
  const activePlanId = getActivePlanId(selector);

  const tableRowStyle = (isSelected: boolean) => {
    if (isSelected) {
      return {
        height: 20,
        padding: 0,
        backgroundColor: theme.palette.grey[800]
      };
    }
    else {
      return {
        height: 20,
        padding: 0,
        borderColor: grey[400]
      };
    }
  }

  const lineNumCellStyle = { width: 24, padding: 1 };
  const stopCellStyle = { width: 10, padding: 1 };
  const stopIconStyle = {
    fill: theme.palette.primary.light,
    width: "15px",
    height: "15px",
    verticalAlign: "middle",
    padding: 0
  };
  const requestCellStyle = { padding: 0 };
  const commentStyle = { color: theme.palette.info.main, padding: 0 };
  const deleteStyle = { width: 40, paddingButtom: 1, paddingTop: 1 };
  const arrowUpwardStyle = { width: 40, paddingButtom: 1, paddingTop: 1 };
  const arrowDownwardStyle = { width: 40, paddingButtom: 1, paddingTop: 1 };

  const showCommandParam = (command: Command) => {
    return (
      <>
        {command.execType !== "RT" && (<>{spacer}{command.execTimeStr}</>)}
        {command.params.length > 0 && (
          command.params.map((param, i) => (
            <React.Fragment key={i}>
              {spacer}{param.value}
            </React.Fragment>
          ))
        )}
      </>
    )
  };

  const showControlBody = (request: Request) => {
    const { method, body } = request;

    switch (method) {
      case "wait_sec":
        return <>{body.time}</>

      case "wait_until":
        return <>{body.variable}{spacer}{body.compare}{spacer}{body.value}{spacer}{body.statement}{spacer}{body.timeoutsec}</>

      case "call":
        return <>{body.fileName}</>

      case "check_value":
        return <>{body.variable}{spacer}{body.compare}{spacer}{body.value}</>

      case "let":
        return <>{body.variable}{spacer}{body.equal}{spacer}{body.equation}</>

      case "get":
        return <>{body.variable}{spacer}{body.value}</>

      default:
        return;
    }
  }

  const statusColor = (status: RequestStatus) => {
    if (status.error) return { margin: 0, color: theme.palette.error.main };
    if (status.success) return { margin: 0, color: theme.palette.success.main };
    return { margin: 0 };
  }
  const deleteUnplannedCommand = () => {
    dispatch(deleteUnplannedCommandAction(props.index));
  }

  const moveUpUnplannedCommand = () => {
    dispatch(moveUpUnplannedCommandAction(props.index));
  }

  const moveDownUnplannedCommand = () => {
    dispatch(moveDownUnplannedCommandAction(props.index));
  }

  const showRequestContent = () => {
    const req = props.line.request;
    const status = props.line.status;

    if (req.syntaxError) {
      return <p style={{ margin: 0, color: theme.palette.error.main }}>{req.errorMessage}</p>;
    }

    switch (req.type) {
      case "comment":
        return <p style={{ margin: 0, color: theme.palette.info.main }}>{req.body}</p>;

      case "command":
        const command = req.body;
        return (
          <p style={statusColor(status)}>
            {(command.component) ? ((command.isViaMobc) ? "MOBC_" + command.execType + "_" + command.component + "_RT." : command.component + "_" + command.execType + ".") : command.execType + "."}
            {command.name}
            {showCommandParam(command)}
            {spacer}
            <span style={{ color: theme.palette.info.main }}>{req.inlineComment}</span>
          </p>
        );

      case "control":
        return (
          <p style={statusColor(status)}>
            {req.method}
            {spacer}
            {showControlBody(req)}
            {spacer}
            <span style={commentStyle}>{req.inlineComment}</span>
          </p>
        )

      default:
        return;
    };
  }

  if (activePlanId == '_unplanned') {
    return (
      <TableRow
        sx={tableRowStyle(props.isSelected)}
        onClick={props.onClick}
      >
        <TableCell sx={lineNumCellStyle} align="right">
          {props.index + 1}
        </TableCell>
        <TableCell sx={stopCellStyle}>
          {props.line.request.stopFlag && <StopIcon sx={stopIconStyle} />}
        </TableCell>
        <TableCell sx={requestCellStyle} >
          {showRequestContent()}
        </TableCell>
        <ArrowUpward
          sx={arrowUpwardStyle}
          onClick={moveUpUnplannedCommand}
        >
        </ArrowUpward>
        <ArrowDownward
          sx={arrowDownwardStyle}
          onClick={moveDownUnplannedCommand}
        >
        </ArrowDownward>
        <Delete
          sx={deleteStyle}
          onClick={deleteUnplannedCommand}
        >
        </Delete>
      </TableRow>
    );
  } else {
    return (
      <>
        <TableRow
          sx={tableRowStyle(props.isSelected)}
          onClick={props.onClick}
          onDoubleClick={props.onDoubleClick}
        >
          <TableCell sx={lineNumCellStyle} align="right">
            {props.index + 1}
          </TableCell>
          <TableCell sx={stopCellStyle}>
            {props.line.request.stopFlag && <StopIcon sx={stopIconStyle} />}
          </TableCell>
          <TableCell sx={requestCellStyle} >
            {showRequestContent()}
          </TableCell>
          <TableCell />
        </TableRow>
      </>
    );
  }
};

export default RequestTableRow;
