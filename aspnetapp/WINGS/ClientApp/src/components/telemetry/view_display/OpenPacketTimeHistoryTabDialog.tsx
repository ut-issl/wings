import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Button, TextField } from '@material-ui/core';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
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

export interface OpenPacketTimeHistoryTabDialogProps {
  blockNum: number,
  classes: Record<'paper', string>;
  keepMounted: boolean;
  open: boolean;
  setTimeId: (id: string) => void;
  tab: TelemetryViewIndex;
  onClose: () => void;
}

const OpenPacketTimeHistoryTabDialog = (props: OpenPacketTimeHistoryTabDialogProps) => {
  const {tab, setTimeId, onClose, blockNum, open } = props;
  const classes = useStyles();
  const selector = useSelector((state: RootState) => state);
  const dispatch = useDispatch();
  const [text, setText] = React.useState("");

  const [value, setValue] = React.useState("");
  const radioGroupRef = React.useRef<HTMLElement>(null);
  
  const telemetryHistory = getTelemetryHistories(selector)[tab.compoName][tab.name];
  const timeHistoryOptions = (telemetryHistory[0].telemetryValues.length == 0) ? [{id: '0', time: "null"}] : telemetryHistory[0].telemetryValues.map((tlmHitory, index) => ({ id: String(index), time: tlmHitory.time }));
  
  const handleEntering = () => {
    if (radioGroupRef.current != null) {
      radioGroupRef.current.focus();
    }
  };

  const handleCancel = () => {
    onClose();
    setValue("");
  };

  const handleOk = () => {
    setTimeId(value);
    onClose();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  const handleChangeText = (e: any) => {
    setText(() => e.target.value)
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
      <DialogTitle id="open-plan-dialog-title">
        <TextField
          label="検索" onChange={handleChangeText}
          value={text} type="text"
          style={{ width: "100%" }}
        />
      </DialogTitle>
      <DialogContent dividers>
        <RadioGroup
          ref={radioGroupRef}
          aria-label="ringtone"
          name="ringtone"
          value={value}
          onChange={handleChange}
        >
          {timeHistoryOptions.length > 0 && (
            timeHistoryOptions.map(telemetryOption => {
              if (telemetryOption.time.toUpperCase().includes(text.toUpperCase())) {
                return <FormControlLabel key={telemetryOption.id} value={telemetryOption.id} control={<Radio />} label={telemetryOption.time} />
              }
            })
          )}
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel} color="primary">
          CANCEL
        </Button>
        <Button onClick={handleOk} color="primary">
          SET
        </Button>
      </DialogActions>
    </Dialog>
  )
};

export default OpenPacketTimeHistoryTabDialog;