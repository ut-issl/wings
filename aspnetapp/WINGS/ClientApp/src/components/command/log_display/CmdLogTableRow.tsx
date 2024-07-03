import React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { Theme, useTheme } from '@mui/material';
import { CommandFileLineLogs } from '../../../models';

export interface CmdLogTableRowProps {
  line: CommandFileLineLogs,
  index: number
}

const CmdLogTableRow = (props: CmdLogTableRowProps) => {
  const spacer = <span style={{ marginRight: "10px" }}></span>;
  const errorMessage = "\"CommandExe\" : Command not found. Check the first word in this line.";
  const theme: Theme = useTheme();

  const statusColor = (status: string) => {
    if (status == "Success") {
      return { color: theme.palette.success.main, margin: 0 };
    }
    else if (status == "Error") {
      return { color: theme.palette.error.main, margin: 0 };
    }
    else if (status == "Comment") {
      return { color: theme.palette.info.main, margin: 0 };
    }
    else {
      return { margin: 0 };
    }
  }

  const showCmdLogContent = () => {
    const content = props.line.content.replace(/"/g, "");
    const status = props.line.status;
    const commentIndex = content.indexOf("#");

    if (commentIndex == 0) {
      return <p style={{ margin: 0, color: theme.palette.info.main }}>{content}</p>;
    }
    else if (commentIndex == -1) {
      return <p style={statusColor(status)}>{(content != "") ? content : errorMessage}</p>;
    }
    else {
      const command = content.slice(0, commentIndex - 1);
      const message = content.slice(commentIndex);
      return (
        <p style={statusColor(status)}>
          {command}
          {spacer}
          <span style={statusColor("Comment")}>{message}</span>
        </p>
      );
    }
  }

  return (
    <TableRow sx={{ height: 20 }}>
      <TableCell style={{ width: 24, padding: "6px 6px 6px 10px" }} align="right">
        {props.index + 1}
      </TableCell>
      <TableCell style={{ width: 10, paddingLeft: 1.5, paddingRight: 1.5 }}>
        {props.line.time}
      </TableCell>
      <TableCell sx={{ padding: 1 }} >
        {showCmdLogContent()}
      </TableCell>
    </TableRow>
  );
};

export default CmdLogTableRow;
