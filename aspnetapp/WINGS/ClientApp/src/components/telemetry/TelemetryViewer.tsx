import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useDispatch,useSelector } from 'react-redux';
import { RootState } from '../../redux/store/RootState';
import { getBlockInfos } from '../../redux/views/selectors';
import ViewDisplayBlock from './view_display/ViewDisplayBlock';
import { Button } from '@material-ui/core';
import { useState } from 'react';
import { getOpid } from '../../redux/operations/selectors';
import OpenLayoutDialog from './view_display/OpenLayoutDialog';

const useStyles = makeStyles(
  createStyles({
    root: {
      display: "flex",
      flexWrap: "wrap"
    },
    button: {
      width: 120
    },
    dialogPaper: {
      width: '80%',
      maxHeight: 435,
    }
}));

const TelemetryViewer = () => {
  const classes = useStyles();
  const selector = useSelector((state: RootState) => state);
  const blockInfos = getBlockInfos(selector);
  const [dialogOpen, setDialogOpen] = useState(false);
 
  const handleDialogOpen = () => {
    setDialogOpen(true);
  }
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const opid = getOpid(selector);

  return (
    <section className="c-section-container">
      <div>
        <Button
          variant="contained" color="primary" className={classes.button}
          onClick={() => handleDialogOpen()}
        >
          Layouts
        </Button>
      </div>
      <div className={classes.root}>
        {blockInfos.length && (
          blockInfos.map((blockInfo,i) => (
            <ViewDisplayBlock key={i} blockInfo={blockInfo} blockNum={i} />
          ))
        )}
      </div>
      <div>
      <OpenLayoutDialog
        classes={{ paper: classes.dialogPaper }}
        keepMounted
        open={dialogOpen}
        onClose={handleDialogClose}
      />
      </div>
    </section>
  )
};

export default TelemetryViewer;