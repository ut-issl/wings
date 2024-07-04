import React, { useCallback, useState } from 'react';
import { Theme, useTheme } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import HeaderMenus from './HeaderMenus';
import DrawerMenus from './DrawerMenus';
import { KeyboardEvent, MouseEvent } from 'react';

const Header = () => {
  const [open, setOpen] = useState(false);
  const theme: Theme = useTheme();
  const appBarStyle = { backgroundColor: theme.palette.grey[800] };
  const toolBarStyle = { paddingLeft: 5 };

  const handleDrawerToggle = useCallback((event: KeyboardEvent | MouseEvent | React.SyntheticEvent) => {
    if ('type' in event && event.type === 'keydown' && (event as KeyboardEvent).key === 'Tab' || (event as KeyboardEvent).key === 'Shift') {
      return;
    }
    setOpen(!open);
  }, [setOpen, open]);

  return (
    <div style={{ flexGrow: 1 }}>
      <AppBar position="static" sx={appBarStyle}>
        <Toolbar sx={toolBarStyle}>
          <HeaderMenus handleDrawerToggle={handleDrawerToggle} />
        </Toolbar>
      </AppBar>
      <DrawerMenus open={open} onClose={handleDrawerToggle} />
    </div>
  );
};

export default Header;
