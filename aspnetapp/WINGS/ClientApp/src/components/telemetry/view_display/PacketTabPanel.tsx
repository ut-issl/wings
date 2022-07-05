import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { useSelector, useDispatch } from 'react-redux';
import { Telemetry, TelemetryViewIndex } from '../../../models';
import { RootState } from '../../../redux/store/RootState';
import { getLatestTelemetries } from '../../../redux/telemetries/selectors';
import Toolbar from '@material-ui/core/Toolbar';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Button from '@material-ui/core/Button';
import { setTelemetryTypePacketAction } from '../../../redux/views/actions';
import CenterFocusStrongIcon from '@material-ui/icons/CenterFocusStrong';
import IconButtonInTabs from '../../common/IconButtonInTabs';
import OpenPacketTabDialog from './OpenPacketTabDialog';

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    root: {
      padding: 10
    },
    item: {
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      },
      [theme.breakpoints.up('sm')]: {
        width: '50%'
      },
      [theme.breakpoints.up('md')]: {
        width: '33.33%'
      },
    },
    tlmul: {
      paddingInlineStart: 0,
      margin: 0
    },
    tlmli: {
      fontSize: 'xx-small',
      display: 'block',
      "& span" : {
        color: theme.palette.success.main
      }
    },
    dataTypeField: {
      fontSize: "10pt",
      textAlign:"center"
    },
    dialogPaper: {
      width: '80%',
      maxHeight: 435,
    }
}));

export interface PacketTabPanelProps {
  tab: TelemetryViewIndex,
  blockNum: number
}

const PacketTabPanel = (props: PacketTabPanelProps) => {
  const { tab, blockNum } = props;
  const selector = useSelector((state: RootState) => state);
  const classes = useStyles();
  const dispatch = useDispatch();
  const tlms = getLatestTelemetries(selector)[tab.name];
  const selectedTelemetries = tab.selectedTelemetries;
  const tlmClassList :[string[]] = [[tab.name]];

  let tlmsDisplayed:Telemetry[] = [];
  tlms.forEach(tlm => {
    if (selectedTelemetries.indexOf(tlm.telemetryInfo.name)>=0){
      tlmsDisplayed.push(tlm);
    }
  })
  const num = tlmsDisplayed.length;

  const [dataType, setDataType] = React.useState(tab.dataType);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDataType((event.target as HTMLInputElement).value);
  };

  const handleOk = () => {
    dispatch(setTelemetryTypePacketAction(blockNum, dataType));
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  }

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const showTlmData = (tlm: Telemetry) => {
    const tlmClasses = tlm.telemetryInfo.name.split('.');
    const tlmClassesDisplayed: JSX.Element[] = [];
    if (tlmClasses.length == 1){
      tlmClassesDisplayed.push(
        <li key={tlm.telemetryInfo.name} className={classes.tlmli}>
          {tlm.telemetryInfo.name} : <span>{(tab.dataType != "Raw")? tlm.telemetryValue.value: tlm.telemetryValue.rawValue}</span>
        </li>
      )
      tlmClassList.push([tlm.telemetryInfo.name]);
    }
    else {
      const thisTlmClasses:string[] = [];
      tlmClasses.forEach((tlmName, i) => {
        let tlmClassesTmp = (i == 0)? tlmName :tlmClasses.slice(0,i+1).join(".");
        if (i == tlmClasses.length-1) {
          tlmClassesDisplayed.push(
            <li key={tlm.telemetryInfo.name} className={classes.tlmli}>
              {<span style={{marginRight: `${10*i}px`}}></span>}
              {tlmName} : <span>{(tab.dataType != "Raw")? tlm.telemetryValue.value: tlm.telemetryValue.rawValue}</span>
            </li>
          )
        }
        else if (tlmClassList[tlmClassList.length-1].indexOf(tlmClassesTmp) == -1) {
          tlmClassesDisplayed.push(
            <li key={tlm.telemetryInfo.name} className={classes.tlmli}>
              {<span style={{marginRight: `${10*i}px`}}></span>}
              {tlmName}
            </li>
          )
        }
        thisTlmClasses.push(tlmClassesTmp);
      })
      tlmClassList.push(thisTlmClasses);
    }
    return (
      <>
      {(tlmClassesDisplayed.map((tlmClass) => tlmClass))}
      </>
    )
  };

  return (
    <div className={classes.root}>
      <Toolbar>
        <FormControl component="fieldset">
          <FormLabel component="legend" className={classes.dataTypeField}>Data Type</FormLabel>
          <RadioGroup aria-label="data-type" name="data-type" value={dataType} onChange={handleChange}>
            <Toolbar>
              <FormControlLabel value="Default" control={<Radio />} label="Default" />
              <FormControlLabel value="Raw" control={<Radio />} label="Raw" />
            </Toolbar>
          </RadioGroup>
        </FormControl>
        <Button onClick={handleOk} color="primary">
          SET
        </Button>
        <IconButtonInTabs onClick={handleDialogOpen}>
          <CenterFocusStrongIcon fontSize="small"/>
        </IconButtonInTabs>
      </Toolbar>
      <OpenPacketTabDialog
        blockNum={blockNum}
        classes={{ paper: classes.dialogPaper }}
        keepMounted
        open={dialogOpen}
        tab={tab}
        onClose={handleDialogClose}
      />
      <Grid
        container
        spacing={2}
      >
        <Grid item className={classes.item}>
          {tlmsDisplayed.filter((tlm,i) => i < num/3)
          .map(tlm => (
            showTlmData(tlm)
          ))}
        </Grid>
        <Grid item className={classes.item}>
          {tlmsDisplayed.filter((tlm,i) => i >= num/3 && i < 2*num/3)
          .map(tlm => (
            showTlmData(tlm)
          ))}
        </Grid>
        <Grid item className={classes.item}>
          {tlmsDisplayed.filter((tlm,i) => i >= 2*num/3 && i < num)
          .map(tlm => (
            showTlmData(tlm)
          ))}
        </Grid>
      </Grid>
    </div>
  )
};

export default PacketTabPanel;
