import React from 'react';
import { Command, CommandPlanLine, Request, RequestStatus } from '../../../models';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import StopIcon from '@mui/icons-material/Stop';
import { ArrowUpward, ArrowDownward, Delete } from '@mui/icons-material';
import { createStyles, makeStyles, Theme } from '@mui/material';
import { deleteUnplannedCommandAction, moveUpUnplannedCommandAction, moveDownUnplannedCommandAction } from '../../../redux/plans/actions';
import { getActivePlanId } from '../../../redux/plans/selectors';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store/RootState';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    row: {
      height: 20
    },
    lineNumCell: {
      width: 24,
      padding: "6px 6px 6px 10px"
    },
    stopCell: {
      width: 10,
      padding: 6
    },
    stopIcon: {
      fill: theme.palette.primary.light,
      width: "15px",
      height: "15px",
      verticalAlign: "middle"
    },
    requestCell: {
      padding: 6
    },
    isSelected: {
      backgroundColor: theme.palette.grey[800]
    },
    execSuccess: {
      color: theme.palette.success.main
    },
    comment: {
      color: theme.palette.info.main
    },
    error: {
      color: theme.palette.error.main
    },
    delete: {
      width: 40
    },
    arrowUpward: {
      width: 40
    },
    arrowDownward: {
      width: 40
    }
  }));

export interface RequestTableRowProps {
  line: CommandPlanLine,
  index: number,
  isSelected: boolean,
  onClick: ((event: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void) | undefined
  onDoubleClick: ((event: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void) | undefined
}

const RequestTableRow = (props: RequestTableRowProps) => {
  const classes = useStyles();
  const spacer = <span style={{ marginRight: "10px" }}></span>;
  const dispatch = useDispatch();
  const selector = useSelector((state: RootState) => state);
  const activePlanId = getActivePlanId(selector);

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
    if (status.error) return classes.error;
    if (status.success) return classes.execSuccess;
    return "";
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
      return <p style={{ margin: 0 }} className={classes.error}>{req.errorMessage}</p>;
    }

    switch (req.type) {
      case "comment":
        return <p style={{ margin: 0 }} className={classes.comment}>{req.body}</p>;

      case "command":
        const command = req.body;
        return (
          <p style={{ margin: 0 }} className={`${statusColor(status)}`}>
            {(command.component) ? ((command.isViaMobc) ? "MOBC_" + command.execType + "_" + command.component + "_RT." : command.component + "_" + command.execType + ".") : command.execType + "."}
            {command.name}
            {showCommandParam(command)}
            {spacer}
            <span className={classes.comment}>{req.inlineComment}</span>
          </p>
        );

      case "control":
        return (
          <p style={{ margin: 0 }} className={`${statusColor(status)}`}>
            {req.method}
            {spacer}
            {showControlBody(req)}
            {spacer}
            <span className={classes.comment}>{req.inlineComment}</span>
          </p>
        )

      default:
        return;
    };
  }

  if (activePlanId == '_unplanned') {
    return (
      <TableRow
        className={`${classes.row} ${props.isSelected ? classes.isSelected : ''}`}
        onClick={props.onClick}
      >
        <TableCell className={classes.lineNumCell} align="right">
          {props.index + 1}
        </TableCell>
        <TableCell className={classes.stopCell}>
          {props.line.request.stopFlag && <StopIcon className={classes.stopIcon} />}
        </TableCell>
        <TableCell className={classes.requestCell} >
          {showRequestContent()}
        </TableCell>
        <ArrowUpward
          className={classes.arrowUpward}
          onClick={moveUpUnplannedCommand}
        >
        </ArrowUpward>
        <ArrowDownward
          className={classes.arrowDownward}
          onClick={moveDownUnplannedCommand}
        >
        </ArrowDownward>
        <Delete
          className={classes.delete}
          onClick={deleteUnplannedCommand}
        >
        </Delete>
      </TableRow>
    );
  } else {
    return (
      <>
        <TableRow
          className={`${classes.row} ${props.isSelected ? classes.isSelected : ''}`}
          onClick={props.onClick}
          onDoubleClick={props.onDoubleClick}
        >
          <TableCell className={classes.lineNumCell} align="right">
            {props.index + 1}
          </TableCell>
          <TableCell className={classes.stopCell}>
            {props.line.request.stopFlag && <StopIcon className={classes.stopIcon} />}
          </TableCell>
          <TableCell className={classes.requestCell} >
            {showRequestContent()}
          </TableCell>
          <TableCell />
        </TableRow>
      </>
    );
  }
};

export default RequestTableRow;
