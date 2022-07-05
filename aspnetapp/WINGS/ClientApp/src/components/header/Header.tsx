import React, { useCallback, useState } from 'react';
import {createStyles, makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import HeaderMenus from './HeaderMenus';
import DrawerMenus from './DrawerMenus';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    appBar: {
      backgroundColor: theme.palette.grey[800]
    },
    toolBar: {
      paddingLeft: 5
    }
}));

const Header = () => {
  const classes = useStyles();

  const [open, setOpen] = useState(false);

  const handleDrawerToggle = useCallback((event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key ==='Shift')) {
      return;
    }
    setOpen(!open);
  }, [setOpen, open])

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar className={classes.toolBar}>
          <HeaderMenus handleDrawerToggle={handleDrawerToggle}/>
        </Toolbar>
      </AppBar>
      <DrawerMenus open={open} onClose={handleDrawerToggle} />
    </div>
  );
};

export default Header;
