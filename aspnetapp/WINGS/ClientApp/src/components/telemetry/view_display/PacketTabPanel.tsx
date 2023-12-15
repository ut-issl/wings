import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { useSelector, useDispatch } from 'react-redux';
import { Telemetry, TelemetryViewIndex } from '../../../models';
import { RootState } from '../../../redux/store/RootState';
import { getTelemetryColor, getLatestTelemetries, getTelemetryHistories } from '../../../redux/telemetries/selectors';
import Toolbar from '@material-ui/core/Toolbar';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Button from '@material-ui/core/Button';
import { setTelemetryTypePacketAction } from '../../../redux/views/actions';
import CenterFocusStrongIcon from '@material-ui/icons/CenterFocusStrong';
import { AlarmAddOutlined } from '@material-ui/icons';
import IconButtonInTabs from '../../common/IconButtonInTabs';
import OpenPacketTabDialog from './OpenPacketTabDialog';
import OpenPacketTimeHistoryTabDialog from './OpenPacketTimeHistoryTabDialog';

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
    tlmLayer: {
      fontSize: 'xx-small',
      display: 'block',
      color: '#ffff00',
      paddingTop: "5px"
    },
    tlmLayerOther: {
      fontSize: 'xx-small',
      display: 'block',
      paddingTop: "5px"
    },
    tlmli: {
      fontSize: 'xx-small',
      display: 'block'
    },
    tlmNormal: {
      "& span" : {
        color: theme.palette.success.main
      }
    },
    tlmColorRed: {
      "& span": {
        color: theme.palette.error.main
      }
    },
    tlmColorBlue: {
      "& span": {
        color: theme.palette.success.dark
      }
    },
    tlmColorGreen: {
      "& span": {
        color: theme.palette.success.contrastText
      }
    },
    dataTypeField: {
      fontSize: "10pt",
      textAlign:"center"
    },
    dialogPaper: {
      width: '80%',
      maxHeight: 435,
    },
    title: {
      color: '#ffff00'
    },
    titleWithSpace: {
      color: 'white',
      fontSize: 12,
      paddingRight: 20
    },
    titleWithOutSpace: {
      color: 'white',
      fontSize: 12,
      paddingRight: 20
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
  const tlms = getLatestTelemetries(selector)[tab.compoName][tab.name];
  const tlmHistory = getTelemetryHistories(selector)[tab.compoName][tab.name];
  const selectedTelemetries = tab.selectedTelemetries;
  const tlmClassList: string[] = [tab.name];
  const tlmColor = getTelemetryColor(selector);

  let tlmsDisplayed:Telemetry[] = [];
  tlms.forEach(tlm => {
    if (selectedTelemetries.indexOf(tlm.telemetryInfo.name) >= 0){
      tlmsDisplayed.push(tlm);
    }
  })
  const num = tlmsDisplayed.length;

  const [dataType, setDataType] = React.useState(tab.dataType);
  const [packetType, setPacketType] = React.useState(tab.packetType);
  const [packetHistoryTimeId, setPacketHistoryTimeId] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [timeHistoryDialogOpen, setTimeHistoryDialogOpen] = React.useState(false);

  const handleChangeDataType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDataType((event.target as HTMLInputElement).value);
  };

  const handleChangePacketType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPacketType((event.target as HTMLInputElement).value);
  };

  const handleOk = () => {
    dispatch(setTelemetryTypePacketAction(blockNum, dataType, packetType));
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  }

  const handleSetTimeId = (id: string) => {
    setPacketHistoryTimeId(id);
  }

  const handleTimeHistoryDialogOpen = () => {
    setTimeHistoryDialogOpen(true);
  }

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleTimeHistoryDialogClose = () => {
    setTimeHistoryDialogOpen(false);
  };

  const setTlmTagColor = (i: number) => {
    if (i <= 2) {
      return classes.tlmLayer;
    } else {
      return classes.tlmLayerOther;
    }
  }

  const setClassName = (dataType: string, value: string) => {
    if (dataType == "Raw") {
      return `${classes.tlmli} ${classes.tlmNormal}`;
    } else if (tlmColor.red.includes(value)) {
      return `${classes.tlmli} ${classes.tlmColorRed}`;
    } else if (tlmColor.green.includes(value)) {
      return `${classes.tlmli} ${classes.tlmColorGreen}`;
    } else if (tlmColor.blue.includes(value)) {
      return `${classes.tlmli} ${classes.tlmColorBlue}`;
    } else {
      return `${classes.tlmli} ${classes.tlmNormal}`;
    }
  }

  const showTlmData = (tlm: Telemetry) => {
    const tlmClasses = tlm.telemetryInfo.name.split('.');
    const tlmClassesDisplayed: JSX.Element[] = [];
    let tlmValue = "";
    if (tab.dataType == "Raw") {
      if (packetType == "RealTime") {
        tlmValue = tlm.telemetryValue.rawValue;
      } else {
        tlmValue = (packetHistoryTimeId == "") ? "" : String(tlmHistory.find(tlmhistory => tlmhistory.telemetryInfo.name == tlm.telemetryInfo.name)?.telemetryValues[Number(packetHistoryTimeId)].rawValue); 
      }
    } else {
      if (packetType == "RealTime") {
        tlmValue = tlm.telemetryValue.value;
      } else {
        tlmValue = (packetHistoryTimeId == "") ? "" : String(tlmHistory.find(tlmhistory => tlmhistory.telemetryInfo.name == tlm.telemetryInfo.name)?.telemetryValues[Number(packetHistoryTimeId)].value); 
      }
    }

    if (tlmClasses.length == 1){
      tlmClassesDisplayed.push(
        <li key={tlm.telemetryInfo.name} className={setClassName(tab.dataType, tlm.telemetryValue.value)}>
          {tlm.telemetryInfo.name} : <span>{(tab.dataType != "Raw")? tlm.telemetryValue.value: tlm.telemetryValue.rawValue}</span>
        </li>
      )
      tlmClassList.push(tlm.telemetryInfo.name);
    } else {
      const thisTlmClasses:string[] = [];
      tlmClasses.forEach((tlmName, i) => {
        let tlmClassesTmp = (i == 0)? tlmName :tlmClasses.slice(0,i+1).join(".");
        if (i == tlmClasses.length - 1) {
          tlmClassesDisplayed.push(
            <li key={tlm.telemetryInfo.name} className={setClassName(tab.dataType, tlmValue)}>
              {<span style={{marginRight: `${10 * i}px`}}></span>}
              {tlmName} : <span>{tlmValue}</span>
            </li>
          )
        } else if (!tlmClassList.includes(tlmClassesTmp)) {
          tlmClassesDisplayed.push(
            <li key={tlm.telemetryInfo.name} className={setTlmTagColor(i)}>
              {<span style={{ marginRight: `${10 * i}px` }}></span>}
              {tlmName}
            </li>
          )
        }
        thisTlmClasses.push(tlmClassesTmp);
      })
      thisTlmClasses.forEach(thisTlmClass => { if (!tlmClassList.includes(thisTlmClass)) tlmClassList.push(thisTlmClass) });
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
        <div>
          <div className={classes.titleWithSpace}>
            <span className={classes.title}>Name : </span>{tab.name}
          </div>
          <div className={classes.titleWithSpace}>
            <span className={classes.title}>Apid : </span> 0x{Number(tab.tlmApid).toString(16)}
          </div>
          <div className={classes.titleWithOutSpace}>
            <span className={classes.title}>Packet Id : </span> 0x{Number(tab.packetId).toString(16)}
          </div>
          <div className={classes.titleWithOutSpace}>
            <span className={classes.title}>Time : </span> {((packetType == "History" && packetHistoryTimeId != "") ?
              String(tlmHistory[0].telemetryValues[Number(packetHistoryTimeId)].time) :
              String(tlms[0].telemetryValue.time))}
          </div>
        </div>
        <FormControl component="fieldset" >
            <FormLabel component="legend" className={classes.dataTypeField}>Data Type</FormLabel>
            <RadioGroup aria-label="data-type" name="data-type" value={dataType} onChange={handleChangeDataType}>
              <Toolbar>
                <FormControlLabel value="Default" control={<Radio />} label="Default" />
                <FormControlLabel value="Raw" control={<Radio />} label="Raw" />
              </Toolbar>
            </RadioGroup>
        </FormControl>
        <FormControl component="fieldset" >
            <FormLabel component="legend" className={classes.dataTypeField}>Packet Type</FormLabel>
            <RadioGroup aria-label="data-type" name="data-type" value={packetType} onChange={handleChangePacketType}>
              <Toolbar>
                <FormControlLabel value="RealTime" control={<Radio />} label="RealTime" />
                <FormControlLabel value="History" control={<Radio />} label="History" />
              </Toolbar>
            </RadioGroup>
        </FormControl>
        <Button onClick={handleOk} color="primary">
          SET
        </Button>
        {(packetType == "History") ?
          <IconButtonInTabs onClick={handleTimeHistoryDialogOpen}>
            <AlarmAddOutlined fontSize="small" />
          </IconButtonInTabs> :
          <></>
        }
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
      <OpenPacketTimeHistoryTabDialog
        blockNum={blockNum}
        classes={{ paper: classes.dialogPaper }}
        keepMounted
        open={timeHistoryDialogOpen}
        tab={tab}
        setTimeId={handleSetTimeId}
        onClose={handleTimeHistoryDialogClose}
      />
      <Grid
        container
        spacing={2}
      >
        <Grid item className={classes.item}>
          {tlmsDisplayed.filter((tlm, i) => i < num / 3)
          .map(tlm => (
            showTlmData(tlm)
          ))}
        </Grid>
        <Grid item className={classes.item}>
          {tlmsDisplayed.filter((tlm, i) => i >= num / 3 && i < 2 * num / 3)
          .map((tlm => (
            showTlmData(tlm)
          )))}
        </Grid>
        <Grid item className={classes.item}>
          {tlmsDisplayed.filter((tlm, i) => i >= 2 * num / 3)
          .map(tlm => (
            showTlmData(tlm)
          ))}
        </Grid>
      </Grid>
    </div>
  )
};

export default PacketTabPanel;
