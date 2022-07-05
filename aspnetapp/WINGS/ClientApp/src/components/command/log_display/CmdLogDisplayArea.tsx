import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store/RootState';
import { getCommandLogs } from '../../../redux/commands/selectors';
import CmdLogTabPanel from './CmdLogTabPanel';
import Button from '@material-ui/core/Button';
import { getOpid } from '../../../redux/operations/selectors';
import { updateCommandLogAction } from '../../../redux/commands/actions';

const useStyles = makeStyles(
  createStyles({
    root: {
      height: 700,
      margin: '.3cm',
      alignContent: 'center'
    },
    dialogPaper: {
      width: '80%',
      maxHeight: 435,
    },
}));

const CmdLogDisplayArea = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const selector = useSelector((state: RootState) => state);
  const opid = getOpid(selector);
  const commandLogs = getCommandLogs(selector);

  const handleOk = async () => {
    if (opid === "") return;
    const res = await fetch(`/api/operations/${opid}/cmd_fileline/log`, {
      method: 'GET'
    });
    const json = await res.json();
    const data = json.data;
    dispatch(updateCommandLogAction(data));
  };
  
  return (
    <>
      <div className={classes.root}>
        <CmdLogTabPanel content={commandLogs} />
        <Button onClick={handleOk} color="primary">
          RELOAD
        </Button>
      </div>
    </>
  );
}

export default CmdLogDisplayArea;
