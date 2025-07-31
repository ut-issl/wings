import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import InputIcon from '@mui/icons-material/Input';
import StopIcon from '@mui/icons-material/Stop';
import UndoIcon from '@mui/icons-material/Undo';
import { useDispatch, useSelector } from 'react-redux';
import { getOpid } from '../../redux/operations/selectors';
import { joinOperationAction, leaveOperationAction } from '../../redux/operations/actions';
import { joinOperation } from '../../redux/operations/operations';
import { Operation } from '../../models';
import { RootState } from '../../redux/store/RootState';
import { cyan } from "@mui/material/colors";
import ConfirmationDialog from '../common/ConfirmationDialog';
import { openErrorDialogAction } from '../../redux/ui/actions';
import { AppDispatch } from '../../redux/store/store';
import { apiFetch } from '../../lib/fetch';

export interface OperationListProps {
  operations: Operation[],
  updateState: () => void
}

const OperationList = (props: OperationListProps) => {
  const selector = useSelector((state: RootState) => state);
  const dispatch = useDispatch<AppDispatch>();
  const opid = getOpid(selector);

  const [open, setOpen] = useState(false);
  const [stopOperation, setStopOperation] = useState<Operation | null>(null);

  const handleStopClick = (operation: Operation) => {
    setOpen(true);
    setStopOperation(operation);
  }

  const joinOperationWrapper = (operation: Operation) => {
    dispatch(joinOperation(operation)).catch((error) => {
      console.error("Error failed to join Operation: ", error);
    })
  };

  const handleOk = async () => {
    if (stopOperation === null) return;
    const res = await apiFetch(`/api/operations/${stopOperation.id}`, {
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

  const handleOkClick = () => {
    handleOk().catch((error) => {
      console.error("Error failed to fetch operation:", error);
    })
  };

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
              <TableCell className="t-row-icon-cell" />
              <TableCell className="t-row-icon-cell" />
              <TableCell className="t-row-icon-cell" />
            </TableRow>
          </TableHead>
          <TableBody>
            {props.operations.length > 0 && (
              props.operations.map(operation => (
                <TableRow key={operation.id} sx={opid === operation.id ? { backgroundColor: cyan[800] } : {}}>
                  <TableCell style={{ width: "150px" }}>{operation.pathNumber}</TableCell>
                  <TableCell>{operation.comment}</TableCell>
                  <TableCell>{operation.component.name}</TableCell>
                  <TableCell>
                    <Tooltip title="Join">
                      <IconButton className="t-row-icon-cell" onClick={() => joinOperationWrapper(operation)}>
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
        open={open} onOkClick={() => handleOkClick()}
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
