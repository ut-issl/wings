import React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store/RootState';
import { getCurrentOperation } from '../../../redux/operations/selectors';
import { getAllIndexes } from '../../../redux/plans/selectors';
import { openPlan } from '../../../redux/plans/operations';
import FileTreeMultiView from '../../common/FileTreeMultiView';
import { AppDispatch } from '../../../redux/store/store';

export interface OpenPlanDialogProps {
  keepMounted: boolean;
  open: boolean;
  onClose: () => void;
}

const OpenPlanDialog = (props: OpenPlanDialogProps) => {
  const selector = useSelector((state: RootState) => state);
  const dispatch = useDispatch<AppDispatch>();
  const { onClose, open, ...other } = props;

  const indexes = getAllIndexes(selector);
  const operation = getCurrentOperation(selector);

  const [values, setValues] = React.useState<string[]>([]);

  const handleCancel = () => {
    onClose();
    setValues([]);
  };

  const handleOk = () => {
    if (values.length != 0) {
      indexes.forEach(index => {
        if (values.includes(index.name)) {
          dispatch(openPlan(index.id));
        }
      })
    }
    onClose();
    setValues([]);
  };

  const rootPath = () => {
    switch (operation.fileLocation) {
      case 'Local':
        if (indexes.length < 2) {
          return "";
        } else {
          return indexes[1].filePath.split('cmdplan')[0] + "cmdplan/";
        }

      default:
        return "";
    }
  }

  return (
    <Dialog
      disableEscapeKeyDown
      maxWidth="xs"
      aria-labelledby="open-plan-dialog-title"
      open={open}
    >
      <DialogTitle id="open-plan-dialog-title">Select Command File</DialogTitle>
      <DialogContent dividers sx={{ height: "60vh" }}>
        <FileTreeMultiView
          files={indexes.slice(1)}
          rootPath={rootPath()}
          select={setValues}
          defaultExpandedFolder={["main", "sub", "test"]}
        />
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={handleOk} color="primary">
          Open
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default OpenPlanDialog;
