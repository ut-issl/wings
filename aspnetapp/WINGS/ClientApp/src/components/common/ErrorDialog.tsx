import React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store/RootState';
import { getErrorDialogState } from '../../redux/ui/selectors';
import { closeErrorDialogAction } from '../../redux/ui/actions';
import HTMLReactParser from 'html-react-parser';

const returnCodeToBr = (text: string) => {
  if (text === "") {
    return text;
  } else {
    return HTMLReactParser(text.replace(/\r?\n/g, '<br/>'));
  }
};

const ErrorDialog = () => {
  const dispatch = useDispatch();
  const selector = useSelector((state: RootState) => state);
  const error = getErrorDialogState(selector);

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      maxWidth="xs"
      aria-labelledby="confirmation-dialog-title"
      open={error.open}
      keepMounted={true}
    >
      <DialogTitle id="confirmation-dialog-title">
        <div className="p-grid__row">
          <ErrorOutlineIcon />
          <Typography style={{ marginLeft: "10px" }}>エラー</Typography>
        </div>
      </DialogTitle>
      <DialogContent dividers>
        {returnCodeToBr(error.message)}
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={() => dispatch(closeErrorDialogAction())}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  )
};

export default ErrorDialog;
