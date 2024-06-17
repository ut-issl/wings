import React, { useState, useEffect, useRef } from 'react';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import { useDispatch, useSelector } from 'react-redux';
import logo from '../../assets/img/logo.png';
import { push } from 'connected-react-router';
import { getOpid } from '../../redux/operations/selectors';
import { RootState } from '../../redux/store/RootState';
import { updateCommandLogAction } from '../../redux/commands/actions';

export interface HeaderMenusProps {
  handleDrawerToggle: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

const HeaderMenus = (props: HeaderMenusProps) => {
  const dispatch = useDispatch();
  const selector = useSelector((state: RootState) => state);
  const opid = getOpid(selector);

  const menuButtonStyle = { fontSize: 16 };

  const handleCmdLog = async () => {
    dispatch(push('/command_log'));
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
      <IconButton onClick={(event) => props.handleDrawerToggle(event)}>
        <MenuIcon />
      </IconButton>
      <img
        src={logo} alt="Logo" width="80px" style={{ margin: "0px 10px 0px 5px" }}
        onClick={() => dispatch(push('/'))}
      />
      <Button color="inherit" sx={menuButtonStyle} onClick={() => dispatch(push('/command'))}>
        Command
      </Button>
      <Button color="inherit" sx={menuButtonStyle} onClick={() => dispatch(push('/telemetry'))}>
        Telemetry
      </Button>
      <Button color="inherit" sx={menuButtonStyle} onClick={handleCmdLog}>
        CmdLog
      </Button>
      <div style={{ flexGrow: 1 }} />
    </>
  )
};

export default HeaderMenus;
