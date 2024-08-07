import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { CommandFileLineLogs } from '../../../models';
import CmdLogTableRow from './CmdLogTableRow';

export interface CmdLogTabPanelProps {
  content: CommandFileLineLogs[]
}

const CmdLogTabPanel = (props: CmdLogTabPanelProps) => {
  const { content } = props;

  return (
    <div
      role="tabpanel"
      id={'vertical-tabpanel-logs'}
      aria-labelledby={'vertical-tab-logs'}
    >
      <TableContainer style={{ width: 850, maxHeight: 700 }} id="plan-table-container">
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: "40px", padding: "0" }} />
              <TableCell style={{ width: "90px", padding: "0", fontWeight: "bold", textAlign: "center" }}>Time</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Command Log</TableCell>
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
