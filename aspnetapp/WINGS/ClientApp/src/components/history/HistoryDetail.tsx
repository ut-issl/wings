import React from 'react';
import { useLocation } from 'react-router-dom';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import { Operation, LocationState } from '../../models';
import LogExportArea from './LogExportArea';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: 1000,
      backgroundColor: theme.palette.background.paper,
    }
  })
);

const HistoryDetail = () => {
  const classes = useStyles();
  const location = useLocation<LocationState<Operation>>();
  const operation = location.state.data;
 
  return (
    <section className="c-section-container">
      <h2 className="u-text__headline">Details</h2>
      <div className="p-content-next-headline">
        <TableContainer className={classes.root}>
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
      <div className="module-spacer--small"/>
      <LogExportArea opid={operation.id}/>
    </section>
  );
};

export default HistoryDetail
