import React from 'react';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { Typography } from '@material-ui/core';
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
          <Typography style={{marginLeft: "10px"}}>エラー</Typography>
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
