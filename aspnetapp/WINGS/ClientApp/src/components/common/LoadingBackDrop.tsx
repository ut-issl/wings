import React from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store/RootState';
import { getIsLoading } from '../../redux/ui/selectors';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
  }),
);

const LoadingBackDrop = () => {
  const classes = useStyles();
  const selector = useSelector((state: RootState) => state);
  const open = getIsLoading(selector);

  return (
    <div>
      <Backdrop className={classes.backdrop} open={open}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  )
};

export default LoadingBackDrop;
