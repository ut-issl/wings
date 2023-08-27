import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Button, TextField } from '@material-ui/core';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store/RootState';
import { SelectOption } from '../../common/SelectBox';
import { TelemetryViewIndex } from '../../../models';
import { getTelemetryHistories } from '../../../redux/telemetries/selectors';
import { selectTelemetryAction } from '../../../redux/views/actions';

const useStyles = makeStyles(
  createStyles({
    paper: {
      height: '80vh',
      width: 500
    }
}));

export interface OpenGraphTabDialogProps {
  blockNum: number,
  classes: Record<'paper', string>;
  keepMounted: boolean;
  open: boolean;
  tab: TelemetryViewIndex;
  onClose: () => void;
}

const OpenGraphTabDialog = (props: OpenGraphTabDialogProps) => {
  const {tab, onClose, blockNum, open } = props;
  const classes = useStyles();
  const selector = useSelector((state: RootState) => state);
  const dispatch = useDispatch();
  const formGroupRef = React.useRef<HTMLElement>(null);
  const [text, setText] = React.useState("");
  
  const telemetryHistories = getTelemetryHistories(selector)[tab.compoName][tab.name];
  const telemetryOptions: SelectOption[] = telemetryHistories.map(telemetryHistory => ({ id: telemetryHistory.telemetryInfo.name, name: telemetryHistory.telemetryInfo.name }));


  interface CheckboxState {
    [id: string] : boolean;
  }

  let initCheckboxState : CheckboxState = {};
  telemetryOptions.forEach(telemetryOption => {
    if (tab.selectedTelemetries.includes(telemetryOption.name) == true){
      initCheckboxState[telemetryOption.id] = true;
    }
    else{
      initCheckboxState[telemetryOption.id] = false;
    }
  });
  
  const [checkboxState, setCheckboxState] = React.useState(initCheckboxState);

  const handleEntering = () => {
    if(formGroupRef.current != null){
      formGroupRef.current.focus();
    }
  };

  const handleCancel = () => {
    onClose();
    setCheckboxState(initCheckboxState);
  };

  const handleOk = () => {
    let telemetryActive :string[] = [];
    telemetryOptions.forEach(telemetryOption => {
      if (checkboxState[telemetryOption.id] === true){
        telemetryActive.push(telemetryOption.name);
      }
    });
    dispatch(selectTelemetryAction(blockNum, telemetryActive));
    onClose();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckboxState({...checkboxState, [(event.target as HTMLInputElement).value]:event.target.checked});
  };

  const handleChangeText = (e: any) => {
    setText(() => e.target.value)
  }

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
      <DialogTitle id="open-plan-dialog-title">
        <TextField
          label="search" onChange={handleChangeText}
          value={text} type="text"
          style={{ width: "100%" }}
        />
      </DialogTitle>
      <DialogContent dividers>
        <FormGroup
          ref={formGroupRef}
          aria-label="ringtone"
          onChange={handleChange}
        >
          {telemetryOptions.length > 0 && (
            telemetryOptions.map(telemetryOption => {
              if (telemetryOption.name.toUpperCase().includes(text.toUpperCase())) {
                return <FormControlLabel key={telemetryOption.id} value={telemetryOption.id}
                  control={<Checkbox checked={checkboxState[telemetryOption.id]} />}
                  label={telemetryOption.name}
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

export default OpenGraphTabDialog;