import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import { useDispatch, useSelector } from 'react-redux';
import logo from '../../assets/img/logo.png';
import { getOpid } from '../../redux/operations/selectors';
import { RootState } from '../../redux/store/RootState';
import { updateCommandLogAction } from '../../redux/commands/actions';
import { grey } from '@mui/material/colors';
import { CommandLogsJson } from '../../models';

export interface HeaderMenusProps {
  handleDrawerToggle: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

const HeaderMenus = (props: HeaderMenusProps) => {
  const dispatch = useDispatch();
  const selector = useSelector((state: RootState) => state);
  const opid = getOpid(selector);
  const navigate = useNavigate();

  const menuButtonStyle = {
    fontSize: 16,
    "&:hover": {
      backgroundColor: grey[700]
    }
  };

  const IconButtonStyle = {
    "&:hover": {
      backgroundColor: grey[700]
    }
  }

  const handleCmdLog = async () => {
    navigate('/command_log');
    if (opid === "") return;
    const res = await fetch(`/api/operations/${opid}/cmd_fileline/log`, {
      method: 'GET'
    });
    const json = await res.json() as CommandLogsJson;
    const data = json.data;
    dispatch(updateCommandLogAction(data));
  };

  const handleCmdLogClick = () => {
    handleCmdLog().catch((error) => {
      console.error("Failed to fetch command log:", error);
    });
  };

  return (
    <>
      <IconButton onClick={(event) => props.handleDrawerToggle(event)} sx={IconButtonStyle}>
        <MenuIcon />
      </IconButton>
      <img
        src={logo} alt="Logo" width="80px" style={{ margin: "0px 10px 0px 5px" }}
        onClick={() => navigate('/')}
      />
      <Button color="inherit" sx={menuButtonStyle} onClick={() => navigate('/command')}>
        Command
      </Button>
      <Button color="inherit" sx={menuButtonStyle} onClick={() => navigate('/telemetry')}>
        Telemetry
      </Button>
      <Button color="inherit" sx={menuButtonStyle} onClick={handleCmdLogClick}>
        CmdLog
      </Button>
      <div style={{ flexGrow: 1 }} />
    </>
  )
};

export default HeaderMenus;
