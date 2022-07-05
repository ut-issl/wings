import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store/RootState';
import { getAllIndexes } from '../../../redux/views/selectors';
import { openViewAction } from '../../../redux/views/actions';
import SelectBox, { SelectOption } from '../../common/SelectBox';
import { getLatestTelemetries } from '../../../redux/telemetries/selectors';
import { selectTelemetryAction } from '../../../redux/views/actions';

const useStyles = makeStyles(
  createStyles({
    paper: {
      height: '80vh',
      width: 500
    }
}));

export interface OpenViewDialogProps {
  blockNum: number,
  classes: Record<'paper', string>;
  keepMounted: boolean;
  open: boolean;
  onClose: () => void;
}

const OpenViewDialog = (props: OpenViewDialogProps) => {
  const { onClose, blockNum, open } = props;
  const classes = useStyles();
  const selector = useSelector((state: RootState) => state);
  const dispatch = useDispatch();

  const formGroupRef = React.useRef<HTMLElement>(null);
  const [type, setType] = React.useState("");
  const indexes = getAllIndexes(selector);
  
  interface CheckboxState {
    [id: string] : boolean;
  }

  let initCheckboxState : CheckboxState = {};
  indexes.forEach(element => initCheckboxState[element.id] = false);
  const [checkboxState, setCheckboxState] = React.useState(initCheckboxState);

  const handleEntering = () => {
    if(formGroupRef.current != null){
      formGroupRef.current.focus();
    }
  };

  const handleCancel = () => {
    onClose();
    let makeCheckboxStateFalse = {...checkboxState};
    indexes.forEach(element => {
      if (checkboxState[element.id] === true){
        makeCheckboxStateFalse[element.id] = false;
      }
      setCheckboxState(makeCheckboxStateFalse);
    })
  };

  const handleOk = () => {
    let makeCheckboxStateFalse = {...checkboxState};
    indexes.forEach(element => {
      if (checkboxState[element.id] === true){
        if (type === "packet" || "graph" && element.type === type){
          dispatch(openViewAction(blockNum, element.id, {}));
          makeCheckboxStateFalse[element.id] = false;
        }
        if (type === "packet"){
          let telemetryShowed :string[] = [];
          let tlms = getLatestTelemetries(selector)[element.name];
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
    setCheckboxState({...checkboxState, [(event.target as HTMLInputElement).value]:event.target.checked});
  };

  const typeOptions: SelectOption[] = ["packet", "character", "graph"].map(type => ({id: type, name: type}));

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
      <SelectBox
          label="Type" options={typeOptions}
          select={setType} value={type}
        />
      </DialogTitle>
      <DialogContent dividers>
        <FormGroup
          ref={formGroupRef}
          aria-label="ringtone"
          onChange={handleChange}
        >
        {indexes.length > 0 && (
            indexes.map(index => {
              if (index.type == type) {
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