import React from 'react';
import { Command, CommandPlanLine, Request, RequestStatus } from '../../../models';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import StopIcon from '@material-ui/icons/Stop';
import { createStyles, makeStyles, Theme } from '@material-ui/core';

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
    }
}));

export interface RequestTableRowProps {
  line: CommandPlanLine,
  index: number,
  isSelected: boolean,
  onClick: ((event: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void) | undefined
}

const RequestTableRow = (props: RequestTableRowProps) => {
  const classes = useStyles();
  const spacer = <span style={{marginRight: "10px"}}></span>;

  const showCommandParam = (command: Command) => {
    return (
      <>
        {command.execType !== "RT" && (<>{spacer}{command.execTime}</>)}
        {command.params.length > 0 && (
          command.params.map((param,i) => (
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
      
      case "call":
        return <>{body.fileName}</>

      case "check_value":
        return <>{body.variable}{spacer}{body.compare}{spacer}{body.value}</>
    
      default:
        return;
    }
  }

  const statusColor = (status: RequestStatus) => {
    if (status.error) return classes.error;
    if (status.success) return classes.execSuccess;
    return "";
  }

  const showRequestContent = () => {
    const req = props.line.request;
    const status = props.line.status;

    if (req.syntaxError) {
      return <p style={{margin: 0}} className={classes.error}>{req.errorMessage}</p>;
    }
    
    switch (req.type) {
      case "comment":
        return <p style={{margin: 0}} className={classes.comment}>{req.body}</p>;
      
      case "command":
        const command = req.body;
        return (
          <p style={{margin: 0}} className={`${statusColor(status)}`}>
            {(command.component) ? ((command.isViaMobc) ? "MOBC_" + command.execType + "_" + command.component + "_RT." : command.component + "_" + command.execType + "." ) : command.execType + "." }
            {command.name}
            {showCommandParam(command)}
            {spacer}
            <span className={classes.comment}>{req.inlineComment}</span>
          </p>
        );
      
      case "control":
        return (
          <p style={{margin: 0}} className={`${statusColor(status)}`}>
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

  return (
    <TableRow
      className={`${classes.row} ${props.isSelected ? classes.isSelected : ''}`}
      onClick={props.onClick}
    >
      <TableCell className={classes.lineNumCell} align="right">
        {props.index+1}
      </TableCell>
      <TableCell className={classes.stopCell}>
        {props.line.request.stopFlag && <StopIcon className={classes.stopIcon} />}
      </TableCell>
      <TableCell className={classes.requestCell} >
        {showRequestContent()}
      </TableCell>
      <TableCell />
    </TableRow>
  );
};

export default RequestTableRow;
