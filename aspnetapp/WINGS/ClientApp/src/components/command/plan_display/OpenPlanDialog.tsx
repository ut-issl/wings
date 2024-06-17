import React from 'react';
import { createStyles, makeStyles } from '@mui/material/styles';
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

const useStyles = makeStyles(
  createStyles({
    paper: {
      height: '60vh',
      width: 500
    }
  }));

export interface OpenPlanDialogProps {
  classes: Record<'paper', string>;
  keepMounted: boolean;
  open: boolean;
  onClose: () => void;
}

const OpenPlanDialog = (props: OpenPlanDialogProps) => {
  const classes = useStyles();
  const selector = useSelector((state: RootState) => state);
  const dispatch = useDispatch();
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
        if (values.indexOf(index.id) >= 0) {
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
      disableBackdropClick
      disableEscapeKeyDown
      maxWidth="xs"
      aria-labelledby="open-plan-dialog-title"
      open={open}
      classes={{ paper: classes.paper }}
    >
      <DialogTitle id="open-plan-dialog-title">Select Command File</DialogTitle>
      <DialogContent dividers>
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
