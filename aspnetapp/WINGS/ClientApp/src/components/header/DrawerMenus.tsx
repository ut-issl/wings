import React from 'react';
import { useNavigate } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import ComputerIcon from '@mui/icons-material/Computer';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { grey } from '@mui/material/colors';

export interface DrawerMenusProps {
  open: boolean,
  onClose: (event: {}) => void
}

const DrawerMenus = (props: DrawerMenusProps) => {
  const navigate = useNavigate();

  const selectMenu = (event: {}, path: string) => {
    navigate(path);
    props.onClose(event);
  }

  const drawerPaperStyle = { width: 256 };

  const menus = [
    { id: "home", label: "Home", icon: <HomeIcon />, value: "/" },
    { id: "history", label: "Operation History", icon: <HistoryIcon />, value: "/history" },
    { id: "compo", label: "Components", icon: <ComputerIcon />, value: "/settings/components" },
    { id: "setting", label: "Settings", icon: <SettingsIcon />, value: "/settings" }
  ];

  return (
    <nav style={{ flexShrink: 0, width: 256 }}>
      <Drawer
        variant="temporary"
        anchor="left"
        open={props.open}
        onClose={(event) => props.onClose(event)}
        PaperProps={drawerPaperStyle}
        ModalProps={{ keepMounted: true }}
      >
        <List>
          <ListItem>
            <IconButton onClick={(event) => props.onClose(event)} style={{ marginLeft: "auto" }}>
              <ArrowBackIosIcon fontSize="small" />
            </IconButton>
          </ListItem>
          <Divider />
          {menus.map(menu => (
            <ListItemButton key={menu.id} onClick={(event) => selectMenu(event, menu.value)}>
              <ListItemIcon sx={{ color: grey[400] }}>
                {menu.icon}
              </ListItemIcon>
              <ListItemText primary={menu.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </nav>
  )
};

export default DrawerMenus;
