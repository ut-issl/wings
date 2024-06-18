import React from 'react';
import { Button, TextField } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store/RootState';
import { getAllIndexes } from '../../../redux/views/selectors';
import { openViewAction } from '../../../redux/views/actions';
import SelectBox, { SelectOption } from '../../common/SelectBox';
import { getLatestTelemetries } from '../../../redux/telemetries/selectors';
import { selectTelemetryAction } from '../../../redux/views/actions';

export interface OpenViewDialogProps {
  blockNum: number,
  keepMounted: boolean;
  open: boolean;
  onClose: () => void;
}

const OpenViewDialog = (props: OpenViewDialogProps) => {
  const { onClose, blockNum, open } = props;
  const selector = useSelector((state: RootState) => state);
  const dispatch = useDispatch();

  const formGroupRef = React.useRef<HTMLElement>(null);
  const [type, setType] = React.useState("packet");
  const indexes = getAllIndexes(selector);
  const [text, setText] = React.useState("");

  interface CheckboxState {
    [id: string]: boolean;
  }

  let initCheckboxState: CheckboxState = {};
  indexes.forEach(element => initCheckboxState[element.id] = false);
  const [checkboxState, setCheckboxState] = React.useState(initCheckboxState);

  const handleEntering = () => {
    if (formGroupRef.current != null) {
      formGroupRef.current.focus();
    }
  };

  const handleCancel = () => {
    onClose();
    let makeCheckboxStateFalse = { ...checkboxState };
    indexes.forEach(element => {
      if (checkboxState[element.id] === true) {
        makeCheckboxStateFalse[element.id] = false;
      }
      setCheckboxState(makeCheckboxStateFalse);
    })
  };

  const handleOk = () => {
    let makeCheckboxStateFalse = { ...checkboxState };
    indexes.forEach(element => {
      if (checkboxState[element.id] === true) {
        if (type === "packet" || "graph" && element.type === type) {
          dispatch(openViewAction(blockNum, element.id, {}));
          makeCheckboxStateFalse[element.id] = false;
        }
        if (type === "packet") {
          let telemetryShowed: string[] = [];
          let tlms = getLatestTelemetries(selector)[element.compoName][element.name];
          tlms.forEach(tlm => {
            telemetryShowed.push(tlm.telemetryInfo.name);
          })
          dispatch(selectTelemetryAction(blockNum, telemetryShowed));
        }
      }
    });
    setCheckboxState(makeCheckboxStateFalse);
    onClose();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckboxState({ ...checkboxState, [(event.target as HTMLInputElement).value]: event.target.checked });
  };

  const handleChangeText = (e: any) => {
    setText(() => e.target.value)
  }

  const typeOptions: SelectOption[] = ["packet", "character", "graph"].map(type => ({ id: type, name: type }));

  return (
    <Dialog
      disableEscapeKeyDown
      maxWidth="xs"
      // onEntering={handleEntering}
      aria-labelledby="open-plan-dialog-title"
      open={open}
    >
      <DialogTitle id="open-plan-dialog-title">
        <div style={{ display: "flex" }}>
          <SelectBox
            label="Type" options={typeOptions}
            select={setType} value={type}
          />
          <TextField
            label="search" onChange={handleChangeText}
            value={text} type="text"
            style={{ marginLeft: 20, width: "100%" }}
          />
        </div>
      </DialogTitle>
      <DialogContent dividers>
        <FormGroup
          ref={formGroupRef}
          aria-label="ringtone"
          onChange={handleChange}
        >
          {indexes.length > 0 && (
            indexes.map(index => {
              if (index.id.toUpperCase().includes(type.toUpperCase()) && type != "" && index.id.toUpperCase().includes(text.toUpperCase())) {
                return <FormControlLabel key={index.id} value={index.id}
                  control={<Checkbox checked={checkboxState[index.id]} />}
                  label={index.name}
                />
              }
            })
          )}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={handleOk} color="primary">
          Open
        </Button>
      </DialogActions>
    </Dialog>
  )
};

export default OpenViewDialog;