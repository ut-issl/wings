import React from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Theme, useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store/RootState';
import { getIsLoading } from '../../redux/ui/selectors';

const LoadingBackDrop = () => {
  const selector = useSelector((state: RootState) => state);
  const open = getIsLoading(selector);
  const theme: Theme = useTheme();
  const backdropStyle = {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  };

  return (
    <div>
      <Backdrop sx={backdropStyle} open={open}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  )
};

export default LoadingBackDrop;
