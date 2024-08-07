import React from 'react';
import { Button, TextField } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store/RootState';
import SelectBox, { SelectOption } from '../../common/SelectBox';
import { getViewLayout, getLayouts } from '../../../redux/views/selectors';
import { useState } from 'react';
import { startLoadingAction, endLoadingAction, openErrorDialogAction } from '../../../redux/ui/actions';
import { fetchLayoutsAction, backViewAction, commitSelectedLayoutAction, tempStoreViewAction } from '../../../redux/views/actions';
import { getOpid } from '../../../redux/operations/selectors';
import { Layout, LayoutJson, TelemetryView } from '../../../models/TelemetryView';

export interface OpenLayoutDialogProps {
  keepMounted: boolean;
  open: boolean;
  onClose: () => void;
}

const OpenLayoutDialog = (props: OpenLayoutDialogProps) => {
  const { onClose, open } = props;
  const selector = useSelector((state: RootState) => state);
  const dispatch = useDispatch();
  const [value, setValue] = useState("");
  const radioGroupRef = React.useRef<HTMLElement>(null);
  const layouts = (getLayouts(selector) != undefined) ? getLayouts(selector) : [];
  const layoutOptions: SelectOption[] = layouts.map(layout => ({ id: layout.id, name: layout.name }));
  const templayout = getViewLayout(selector);

  const buttonStyle = { width: 120 };

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
    const names: string[] = [];
    const views: TelemetryView[] = [];
    for (const layout of layouts) {
      names.push(layout.name);
      views.push(layout.telemetryView);
    }
    if (names.includes(text) || text == "") {
      setText(() => "");
      dispatch(openErrorDialogAction("invalid layout name"));
    }
    else if (views.includes(templayout)) {
      setText(() => "");
      dispatch(openErrorDialogAction("invalid layout name"));
    }
    else {
      const res = await fetch(`/api/operations/${opid}/lyt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }, body: JSON.stringify({
          telemetryView: {
            allIndexes: templayout.allIndexes,
            blocks: templayout.blocks
          },
          id: layouts.length,
          name: text
        })
      });
      dispatch(endLoadingAction());
      setText(() => "");
      const res_lyts = await fetch(`/api/operations/${opid}/lyt`, {
        method: 'GET'
      });
      const json_lyts = await res_lyts.json() as LayoutJson;
      const lyts = json_lyts.data;
      dispatch(fetchLayoutsAction(lyts));
    }
    onClose();
  }

  const saveLayoutClick = (text: string) => {
    saveLayoutAsync(text).catch(error => {
      console.error("Error failed to save layout:", error);
    })
  };

  const deleteLayoutAsync = async () => {
    const index = handleLayoutIndexChange(layoutIndex);
    const name = layouts[index].name;
    dispatch(startLoadingAction());
    const res = await fetch(`/api/operations/${opid}/lyt/${name}`, {
      method: 'DELETE'
    });
    dispatch(endLoadingAction());
    setText(() => "");
    const res_lyts = await fetch(`/api/operations/${opid}/lyt`, {
      method: 'GET'
    });
    const json_lyts = await res_lyts.json() as LayoutJson;
    const lyts = json_lyts.data;
    dispatch(fetchLayoutsAction(lyts));
    onClose();
  }

  const deleteLayoutClick = () => {
    deleteLayoutAsync().catch(error => {
      console.error("Error failed to delete layout:", error);
    })
  };

  const renameLayoutAsync = async (text: string) => {
    const names: string[] = [];
    const views: TelemetryView[] = [];
    for (const layout of layouts) {
      names.push(layout.name);
      views.push(layout.telemetryView);
    }
    if (names.includes(text) || text == "") {
      setText(() => "");
      dispatch(openErrorDialogAction("invalid layout name"));
    }
    else {
      const index = handleLayoutIndexChange(layoutIndex);
      dispatch(startLoadingAction());
      const res = await fetch(`/api/operations/${opid}/lyt/${index}/${text}`, {
        method: 'PUT'
      });
      dispatch(endLoadingAction());
      setText(() => "");
      const res_lyts = await fetch(`/api/operations/${opid}/lyt`, {
        method: 'GET'
      });
      const json_lyts = await res_lyts.json() as LayoutJson;
      const lyts = json_lyts.data;
      dispatch(fetchLayoutsAction(lyts));
    }
    onClose();
  }

  const renameLayoutClick = (text: string) => {
    renameLayoutAsync(text).catch(error => {
      console.error("Error failed to rename layout:", error);
    })
  };


  const [text, setText] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const [layoutIndex, setLayoutIndex] = useState('');

  const handleLayoutIndexChange = (layoutIndex: string) => {
    setLayoutIndex(layoutIndex);
    const index: number = +layoutIndex;
    return index;
  }

  const handleOk = () => {
    const index = handleLayoutIndexChange(layoutIndex);
    dispatch(commitSelectedLayoutAction(index));
    setLayoutIndex('');
    onClose();
  };

  return (
    <Dialog
      disableEscapeKeyDown
      maxWidth="xs"
      // onEntering={handleEntering}
      aria-labelledby="open-plan-dialog-title"
      open={open}
    >
      <DialogTitle id="open-plan-dialog-title">Temporary Save and Restore</DialogTitle>
      <DialogContent dividers>
        <div>
          <Button
            variant="contained" color="primary" sx={buttonStyle}
            onClick={() => tempStoreView()}
          >
            Save
          </Button>
          <Button
            variant="contained" color="primary" sx={buttonStyle}
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
            variant="contained" color="primary" sx={buttonStyle}
            onClick={() => saveLayoutClick(text)}
          >
            Save
          </Button>
          <Button
            variant="contained" color="primary" sx={buttonStyle}
            onClick={() => renameLayoutClick(text)}
          >
            Rename
          </Button>
        </div>
        <div>
          <Button
            variant="contained" color="primary" sx={buttonStyle}
            onClick={() => handleOk()}
          >
            Restore
          </Button>
          <Button
            variant="contained" color="primary" sx={buttonStyle}
            onClick={() => deleteLayoutClick()}
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
