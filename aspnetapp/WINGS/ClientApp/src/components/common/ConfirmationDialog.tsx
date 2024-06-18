import React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';

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
