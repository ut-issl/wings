import React from 'react';
import { useLocation } from 'react-router-dom';
import { Theme, useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { Operation, LocationState } from '../../models';
import LogExportArea from './LogExportArea';

const HistoryDetail = () => {
  const location = useLocation<LocationState<Operation>>();
  const operation = location.state.data;
  const theme: Theme = useTheme();

  const rootStyle = {
    width: '100%',
    maxWidth: 1000,
    backgroundColor: theme.palette.background.paper,
  };

  return (
    <section className="c-section-container">
      <h2 className="u-text__headline">Details</h2>
      <div className="p-content-next-headline">
        <TableContainer sx={rootStyle}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>opid</TableCell>
                <TableCell>{operation.id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Path Number</TableCell>
                <TableCell>{operation.pathNumber}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Comment</TableCell>
                <TableCell>{operation.comment}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Component</TableCell>
                <TableCell>{operation.component.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Operator</TableCell>
                <TableCell>{operation.operator ? operation.operator.userName : "Unkown"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Start Time</TableCell>
                <TableCell>{operation.createdAt.replace("T", " ")}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <div className="module-spacer--small" />
      <LogExportArea opid={operation.id} />
    </section>
  );
};

export default HistoryDetail
