import React from 'react';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';

export interface ConfirmationDialogProps {
  open: boolean;
  labelOk: string;
  children?: React.ReactNode
  onOkClick: () => void;
  onClose: () => void;
}

const ConfirmationDialog = (props: ConfirmationDialogProps) => {
  const { open, labelOk, children, onOkClick, onClose } = props;

  const handleOkClick = () => {
    onOkClick();
    onClose();
  }

  const handleCancelClick = () => {
    onClose();
  }

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      maxWidth="xs"
      aria-labelledby="confirmation-dialog-title"
      open={open}
      keepMounted={true}
    >
      <DialogTitle id="confirmation-dialog-title">Confirmation</DialogTitle>
      <DialogContent dividers>
        {children}
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancelClick} color="primary">
          Cancel
        </Button>
        <Button color="secondary" onClick={handleOkClick}>
          {labelOk}
        </Button>
      </DialogActions>
    </Dialog>
  )
};

export default ConfirmationDialog;
