import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import HomeIcon from '@material-ui/icons/Home';
import HistoryIcon from '@material-ui/icons/History';
import SettingsIcon from '@material-ui/icons/Settings';
import ComputerIcon from '@material-ui/icons/Computer';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

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
    {id: "home", label: "Home", icon: <HomeIcon />, value: "/"},
    {id: "history", label: "Operation History", icon: <HistoryIcon />, value: "/history"},
    {id: "compo", label: "Components", icon: <ComputerIcon />, value: "/settings/components"},
    {id: "setting", label: "Settings", icon: <SettingsIcon />, value: "/settings"}
  ];

  return (
    <nav className={classes.drawer}>
      <Drawer
        variant="temporary"
        anchor="left"
        open={props.open}
        onClose={(event) => props.onClose(event)}
        classes={{paper: classes.drawerPaper}}
        ModalProps={{keepMounted: true}}
      >
        <List>
          <ListItem>
            <IconButton onClick={(event) => props.onClose(event)} style={{marginLeft: "auto"}}>
              <ArrowBackIosIcon fontSize="small"/>
            </IconButton>
          </ListItem>
          <Divider　/>
          {menus.map(menu => (
            <ListItem button key={menu.id} onClick={(event) => selectMenu(event, menu.value)}>
              <ListItemIcon>
                {menu.icon}
              </ListItemIcon>
              <ListItemText primary={menu.label}/>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </nav>
  )
};

export default DrawerMenus;
