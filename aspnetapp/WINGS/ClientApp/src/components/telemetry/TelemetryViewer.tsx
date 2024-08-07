import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store/RootState';
import { getBlockInfos } from '../../redux/views/selectors';
import ViewDisplayBlock from './view_display/ViewDisplayBlock';
import { Button } from '@mui/material';
import { useState } from 'react';
import { getOpid } from '../../redux/operations/selectors';
import OpenLayoutDialog from './view_display/OpenLayoutDialog';

const TelemetryViewer = () => {
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
          variant="contained" color="primary" sx={{ width: 120 }}
          onClick={() => handleDialogOpen()}
        >
          Layouts
        </Button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {blockInfos.length && (
          blockInfos.map((blockInfo, i) => (
            <ViewDisplayBlock key={i} blockInfo={blockInfo} blockNum={i} />
          ))
        )}
      </div>
      <div>
        <OpenLayoutDialog
          keepMounted
          open={dialogOpen}
          onClose={handleDialogClose}
        />
      </div>
    </section>
  )
};

export default TelemetryViewer;