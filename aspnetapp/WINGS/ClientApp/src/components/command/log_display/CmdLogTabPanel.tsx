import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { CommandFileLineLogs } from '../../../models';
import CmdLogTableRow from './CmdLogTableRow';

const useStyles = makeStyles(
  createStyles({
    container: {
      width: 850,
      maxHeight: 700,
    },
    tableEventShifter: {
      position: "absolute",
      zIndex: -10,
      outline: 0
    }
}));

export interface CmdLogTabPanelProps {
  content: CommandFileLineLogs[]
}

const CmdLogTabPanel = (props: CmdLogTabPanelProps) => {
  const { content } = props;
  const classes = useStyles();

  return (
    <div
      role="tabpanel"
      id={'vertical-tabpanel-logs'}
      aria-labelledby={'vertical-tab-logs'}
    >
      <TableContainer className={classes.container} id="plan-table-container">
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell style={{width: "40px", padding: "0"}}/>
              <TableCell style={{width: "90px", padding: "0", fontWeight: "bold", textAlign: "center"}}>Time</TableCell>
              <TableCell style={{fontWeight: "bold"}}>Command Log</TableCell>
            </TableRow>
          </TableHead>
          <TableBody id="plan-table-body">
            {content.length >= 1 && (
              content.map((line, i) => (
                <CmdLogTableRow
                  line={line} index={i}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default CmdLogTabPanel;
