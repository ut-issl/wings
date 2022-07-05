import React, { useState } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import InputIcon from '@material-ui/icons/Input';
import StopIcon from '@material-ui/icons/Stop';
import UndoIcon from '@material-ui/icons/Undo';
import { useDispatch, useSelector } from 'react-redux';
import { getOpid } from '../../redux/operations/selectors';
import { leaveOperationAction } from '../../redux/operations/actions';
import { joinOperation } from '../../redux/operations/operations';
import { Operation } from '../../models';
import { RootState } from '../../redux/store/RootState';
import { cyan } from "@material-ui/core/colors";
import ConfirmationDialog from '../common/ConfirmationDialog';
import { openErrorDialogAction } from '../../redux/ui/actions';

const useStyles = makeStyles( 
  createStyles({
    isJoining: {
      backgroundColor: cyan[800]
    },
  })
);

export interface OperationListProps {
  operations: Operation[],
  updateState: () => void
}

const OperationList = (props: OperationListProps) => {
  const classes = useStyles();
  const selector = useSelector((state: RootState) => state);
  const dispatch = useDispatch();
  const opid = getOpid(selector);

  const [open, setOpen] = useState(false);
  const [stopOperation, setStopOperation] = useState<Operation | null>(null);

  const handleStopClick = (operation: Operation) => {
    setOpen(true);
    setStopOperation(operation);
  }

  const handleOkClick = async () => {
    const res = await fetch(`/api/operations/${stopOperation?.id}`, {
      method: 'DELETE'
    })
    if (res.status === 204) {
      if (stopOperation?.id === opid) {
        dispatch(leaveOperationAction());
      }
      props.updateState();
    } else if (res.status === 403) {
      const message = `Status Code: ${res.status}\nYou don't have the necessary authority`;
      dispatch(openErrorDialogAction(message));
    }
  }

  const handleDialogClose = () => {
    setOpen(false);
    setStopOperation(null);
  }

  const leaveOperation = (id: string) => {
    id === opid && dispatch(leaveOperationAction());
  }

  return (
    <div className="p-content-next-headline">
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Path Number</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Component</TableCell>
              <TableCell className="t-row-icon-cell"/>
              <TableCell className="t-row-icon-cell"/>
              <TableCell className="t-row-icon-cell"/>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.operations.length > 0 && (
              props.operations.map(operation => (
                <TableRow key={operation.id} className={`${opid === operation.id && classes.isJoining}`}>
                  <TableCell style={{width: "150px"}}>{operation.pathNumber}</TableCell>
                  <TableCell>{operation.comment}</TableCell>
                  <TableCell>{operation.component.name}</TableCell>
                  <TableCell>
                    <Tooltip title="Join">
                      <IconButton className="t-row-icon-cell" onClick={() => dispatch(joinOperation(operation))}>
                        <InputIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Leave">
                      <IconButton className="t-row-icon-cell" onClick={() => leaveOperation(operation.id)}>
                        <UndoIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Stop">
                      <IconButton className="t-row-icon-cell" onClick={() => handleStopClick(operation)}>
                        <StopIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <ConfirmationDialog
        open={open} onOkClick={async () => await handleOkClick()}
        labelOk="Stop" onClose={handleDialogClose}
      >
        <p>Are your sure to stop</p>
        <p>{stopOperation?.pathNumber} : {stopOperation?.comment}</p>
        <p>?</p>
      </ConfirmationDialog>
    </div>
  );
};

export default OperationList;
