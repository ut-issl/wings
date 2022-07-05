import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import { CommandFileLineLogs } from '../../../models';

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
    commanderCell: {
      width: 20,
      padding: 6
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

export interface CmdLogTableRowProps {
  line: CommandFileLineLogs,
  index: number
}

const CmdLogTableRow = (props: CmdLogTableRowProps) => {
  const classes = useStyles();
  const spacer = <span style={{marginRight: "10px"}}></span>;
  const errorMessage = "\"CommandExe\" : Command not found. Check the first word in this line.";

  const statusColor = (status: string) => {
    if(status == "Success"){
      return classes.execSuccess;
    }
    else if(status == "Error"){
      return classes.error;
    }
    else{
      return "";
    }
  }

  const showCmdLogContent = () => {
    const content = props.line.content.replace(/"/g,"");
    const status = props.line.status;
    const commentIndex = content.indexOf("#");
    
    if (commentIndex == 0){
      return <p style={{margin: 0}} className={classes.comment}>{content}</p>;
    }
    else if (commentIndex == -1) {
      return <p style={{margin: 0}} className={`${statusColor(status)}`}>{(content!="")?content:errorMessage}</p>;
    }
    else {
      let command = content.slice(0,commentIndex-1);
      let message = content.slice(commentIndex);
      return (
        <p style={{margin: 0}} className={`${statusColor(status)}`}>
          {command}
          {spacer}
          <span className={classes.comment}>{message}</span>
        </p>
      );
    }
  }

  return (
    <TableRow
      className={`${classes.row}`}
    >
      <TableCell className={classes.lineNumCell} align="right">
        {props.index+1}
      </TableCell>
      <TableCell className={classes.stopCell}>
        {props.line.time}
      </TableCell>
      <TableCell className={classes.requestCell} >
        {showCmdLogContent()}
      </TableCell>
    </TableRow>
  );
};

export default CmdLogTableRow;
