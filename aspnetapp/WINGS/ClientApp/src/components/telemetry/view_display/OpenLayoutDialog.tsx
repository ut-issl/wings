import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Button, TextField } from '@material-ui/core';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store/RootState';
import SelectBox, { SelectOption } from '../../common/SelectBox';
import { getViewLayout, getLayouts } from '../../../redux/views/selectors';
import { useState } from 'react';
import { startLoadingAction, endLoadingAction, openErrorDialogAction } from '../../../redux/ui/actions';
import { fetchLayoutsAction, backViewAction, selectedLayoutCommitAction, tempStoreViewAction } from '../../../redux/views/actions';
import { getOpid } from '../../../redux/operations/selectors';
import { Layout } from '../../../models/TelemetryView';

const useStyles = makeStyles(
  createStyles({
    button: {
      width: 120
    },
    paper: {
      height: '80vh',
      width: 500
    }
}));

export interface OpenLayoutDialogProps {
  classes: Record<'paper', string>;
  keepMounted: boolean;
  open: boolean;
  onClose: () => void;
}

const OpenLayoutDialog = (props: OpenLayoutDialogProps) => {
  const { onClose, open } = props;
  const classes = useStyles();
  const selector = useSelector((state: RootState) => state);
  const dispatch = useDispatch();
  const [value, setValue] = useState("");
  const radioGroupRef = React.useRef<HTMLElement>(null);
  const layouts = (getLayouts(selector)!=undefined)?getLayouts(selector):[];
  const layoutOptions: SelectOption[] = layouts.map(layout => ({ id: layout.id, name: layout.name }));
  const templayout = getViewLayout(selector);

  const tempStoreView = () => {
    dispatch(tempStoreViewAction(templayout));
    onClose();
  }
  const backLayout = () => {
    dispatch(backViewAction());
    onClose();
  }

  const opid = getOpid(selector);
  const saveLayoutAsync = async (text: string) => {
    var names: string[] = [];
    var views: any[] = [];
    for (var layout of layouts){
      names.push(layout.name);
      views.push(layout.telemetryView);
    }
    if (names.includes(text)||text==""){
      setText(() => "");
      dispatch(openErrorDialogAction("invalid layout name"));
    }
    else if (views.includes(templayout)){
      setText(() => "");
      dispatch(openErrorDialogAction("invalid layout name"));
    }
    else {
      const res = await fetch(`/api/operations/${opid}/lyt`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },        body: JSON.stringify({
          telemetryView: {
            allIndexes: templayout.allIndexes,
            blocks: templayout.blocks,
            contents: templayout.contents
          },
          id: layouts.length,
          name: text
        })
      });
      dispatch(endLoadingAction());
      setText(() => "");
      const res_lyts = await fetch(`/api/operations/${opid}/lyt`,{
        method: 'GET'
      });
      const json_lyts = await res_lyts.json();
      const lyts = json_lyts.data as Layout[];
      dispatch(fetchLayoutsAction(lyts));
    }
    onClose();
  }

  const deleteLayoutAsync = async () => {
    const index = handleLayoutIndexChange(layoutIndex);
    const name = layouts[index].name;
    dispatch(startLoadingAction());
    const res = await fetch(`/api/operations/${opid}/lyt/${name}`,{
      method: 'DELETE'
    });
    dispatch(endLoadingAction());
    setText(() => "");
    const res_lyts = await fetch(`/api/operations/${opid}/lyt`, {
      method: 'GET'
    });
    const json_lyts = await res_lyts.json();
    const lyts = json_lyts.data as Layout[];
    dispatch(fetchLayoutsAction(lyts));
    onClose();
  }

  const renameLayoutAsync = async (text: string) => {
    var names: string[] = [];
    var views: any[] = [];
    for (var layout of layouts){
      names.push(layout.name);
      views.push(layout.telemetryView);
    }
    if (names.includes(text)||text==""){
      setText(() => "");
      dispatch(openErrorDialogAction("invalid layout name"));
    }
    else{
      const index = handleLayoutIndexChange(layoutIndex);
      dispatch(startLoadingAction());
      const res = await fetch(`/api/operations/${opid}/lyt/${index}/${text}`,{
        method: 'PUT'
      });
      dispatch(endLoadingAction());
      setText(() => "");
      const res_lyts = await fetch(`/api/operations/${opid}/lyt`,{
        method: 'GET'
      });
      const json_lyts = await res_lyts.json();
      const lyts = json_lyts.data as Layout[];
      dispatch(fetchLayoutsAction(lyts));
    }
    onClose();
  }


  const [text, setText] = useState('');
  const handleChange = (e: any) => {
    setText(() => e.target.value)
  }

  const handleEntering = () => {
    if (radioGroupRef.current != null) {
      radioGroupRef.current.focus();
    }
  };

  const handleCancel = () => {
    onClose();
    setValue("");
  };

  var [layoutIndex, setLayoutIndex] = useState('');

  const handleLayoutIndexChange = (layoutIndex: string) => {
    setLayoutIndex(layoutIndex);
    const index: number = +layoutIndex;
    return index;
  }

  const handleOk = async () => {
    const index = handleLayoutIndexChange(layoutIndex);
    dispatch(selectedLayoutCommitAction(index));
    layoutIndex = '';
    onClose();
  };

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      maxWidth="xs"
      onEntering={handleEntering}
      aria-labelledby="open-plan-dialog-title"
      open={open}
      classes={{ paper: classes.paper }}
    >
      <DialogTitle id="open-plan-dialog-title">Temporary Save and Restore</DialogTitle>
      <DialogContent dividers>
        <div>
      <Button
          variant="contained" color="primary" className={classes.button}
          onClick={() => tempStoreView()}
        >
          Save
        </Button>
        <Button
          variant="contained" color="primary" className={classes.button}
          onClick={() => backLayout()}
        >
          Restore
        </Button>
      </div>
      </DialogContent>
      <DialogTitle id="open-plan-dialog-title">Save and Select</DialogTitle>
      <DialogContent>
      <div>
        <SelectBox
          label="Select from Saved Layouts" options={layoutOptions}
          select={handleLayoutIndexChange} value={layoutIndex}
        />
      </div>
      <div>
        <TextField
            label="Save As" onChange={handleChange}
            value={text} type="text"
          />
      </div>
      <div>
        <Button
          variant="contained" color="primary" className={classes.button}
          onClick={() => saveLayoutAsync(text)}
        >
          Save
        </Button>
        <Button 
          variant="contained" color="primary" className={classes.button}
          onClick={() => renameLayoutAsync(text)}
        >
          Rename
        </Button>
      </div>
      <div>
        <Button 
          variant="contained" color="primary" className={classes.button}
          onClick={() => handleOk()}
        >
          Restore
        </Button>
        <Button 
          variant="contained" color="primary" className={classes.button}
          onClick={() => deleteLayoutAsync()}
        >
          Delete
        </Button>
      </div>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
};

export default OpenLayoutDialog;
