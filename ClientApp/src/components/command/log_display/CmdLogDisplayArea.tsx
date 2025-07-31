import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store/RootState';
import { getCommandLogs } from '../../../redux/commands/selectors';
import CmdLogTabPanel from './CmdLogTabPanel';
import Button from '@mui/material/Button';
import { getOpid } from '../../../redux/operations/selectors';
import { updateCommandLogAction } from '../../../redux/commands/actions';
import { CommandLogsJson } from '../../../models';

const CmdLogDisplayArea = () => {
  const dispatch = useDispatch();
  const selector = useSelector((state: RootState) => state);
  const opid = getOpid(selector);
  const commandLogs = getCommandLogs(selector);

  const handleOk = async () => {
    if (opid === "") return;
    const res = await fetch(`/api/operations/${opid}/cmd_fileline/log`, {
      method: 'GET'
    });
    const json = await res.json() as CommandLogsJson;
    const data = json.data;
    dispatch(updateCommandLogAction(data));
  };

  const handleButtonClick = () => {
    handleOk().catch(error => {
      console.error("Failed to fetch command fileline logs:", error);
    });
  };

  return (
    <>
      <div style={{ height: 700, margin: '.3cm' }}>
        <CmdLogTabPanel content={commandLogs} />
        <Button onClick={handleButtonClick} color="primary">
          RELOAD
        </Button>
      </div>
    </>
  );
}

export default CmdLogDisplayArea;
