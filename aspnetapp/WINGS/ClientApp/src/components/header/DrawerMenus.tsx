import React from 'react';
import { createStyles, makeStyles } from '@mui/material';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import ComputerIcon from '@mui/icons-material/Computer';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

const useStyles = makeStyles(
  createStyles({
    drawer: {
      flexShrink: 0,
      width: 256
    },
    drawerPaper: {
      width: 256
    }
  }));

export interface DrawerMenusProps {
  open: boolean,
  onClose: (event: {}) => void
}

const DrawerMenus = (props: DrawerMenusProps) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const selectMenu = (event: {}, path: string) => {
    dispatch(push(path));
    props.onClose(event);
  }

  const menus = [
    { id: "home", label: "Home", icon: <HomeIcon />, value: "/" },
    { id: "history", label: "Operation History", icon: <HistoryIcon />, value: "/history" },
    { id: "compo", label: "Components", icon: <ComputerIcon />, value: "/settings/components" },
    { id: "setting", label: "Settings", icon: <SettingsIcon />, value: "/settings" }
  ];

  return (
    <nav className={classes.drawer}>
      <Drawer
        variant="temporary"
        anchor="left"
        open={props.open}
        onClose={(event) => props.onClose(event)}
        classes={{ paper: classes.drawerPaper }}
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
            <ListItem button key={menu.id} onClick={(event) => selectMenu(event, menu.value)}>
              <ListItemIcon>
                {menu.icon}
              </ListItemIcon>
              <ListItemText primary={menu.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </nav>
  )
};

export default DrawerMenus;
