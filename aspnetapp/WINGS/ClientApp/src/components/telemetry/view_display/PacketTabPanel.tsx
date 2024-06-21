import React from 'react';
import { Theme, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import { useSelector, useDispatch } from 'react-redux';
import { Telemetry, TelemetryViewIndex } from '../../../models';
import { RootState } from '../../../redux/store/RootState';
import { getTelemetryColor, getLatestTelemetries } from '../../../redux/telemetries/selectors';
import Toolbar from '@mui/material/Toolbar';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';
import { setTelemetryTypePacketAction } from '../../../redux/views/actions';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import IconButtonInTabs from '../../common/IconButtonInTabs';
import OpenPacketTabDialog from './OpenPacketTabDialog';

export interface PacketTabPanelProps {
  tab: TelemetryViewIndex,
  blockNum: number
}

const PacketTabPanel = (props: PacketTabPanelProps) => {
  const { tab, blockNum } = props;
  const selector = useSelector((state: RootState) => state);
  const dispatch = useDispatch();
  const tlms = getLatestTelemetries(selector)[tab.compoName][tab.name];
  const selectedTelemetries = tab.selectedTelemetries;
  const tlmClassList: string[] = [tab.name];
  const tlmColor = getTelemetryColor(selector);
  const theme: Theme = useTheme();

  let tlmsDisplayed: Telemetry[] = [];
  tlms.forEach(tlm => {
    if (selectedTelemetries.indexOf(tlm.telemetryInfo.name) >= 0) {
      tlmsDisplayed.push(tlm);
    }
  })
  const num = tlmsDisplayed.length;

  const [dataType, setDataType] = React.useState(tab.dataType);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const itemStyle = {
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
    [theme.breakpoints.up('sm')]: {
      width: '50%'
    },
    [theme.breakpoints.up('md')]: {
      width: '33.33%'
    },
  };
  const tlmliStyle = {
    fontSize: 'xx-small',
    display: 'block',
  };
  const tlmulStyle = {
    paddingInlineStart: 0,
    margin: 0
  };
  const tlmLayerStyle = {
    fontSize: 'xx-small',
    display: 'block',
    color: '#ffff00',
    paddingTop: "5px"
  };
  const tlmLayerOtherStyle = {
    fontSize: 'xx-small',
    display: 'block',
    paddingTop: "5px"
  };
  const tlmNormalStyle = {
    color: theme.palette.success.main
  };
  const tlmColorRedStyle = {
    color: theme.palette.error.main
  };
  const tlmColorBlueStyle = {
    color: theme.palette.success.dark
  };
  const tlmColorGreenStyle = {
    color: theme.palette.success.contrastText
  };
  const dataTypeFieldStyle = {
    fontSize: "10pt",
    textAlign: "center"
  };
  const titleStyle = {
    color: '#ffff00'
  };
  const titleWithSpaceStyle = {
    color: 'white',
    fontSize: 12,
    paddingRight: 20
  };
  const titleWithOutSpaceStyle = {
    color: 'white',
    fontSize: 12,
    paddingRight: 20
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDataType((event.target as HTMLInputElement).value);
  };

  const handleOk = () => {
    dispatch(setTelemetryTypePacketAction({ block: blockNum, dataType: dataType }));
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  }

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const setTlmTagColor = (i: number) => {
    if (i <= 2) {
      return tlmLayerStyle;
    } else {
      return tlmLayerOtherStyle;
    }
  }

  const setClassName = (dataType: string, value: string) => {
    if (dataType == "Raw") {
      return tlmNormalStyle;
    } else if (tlmColor.red.includes(value)) {
      return tlmColorRedStyle;
    } else if (tlmColor.green.includes(value)) {
      return tlmColorGreenStyle;
    } else if (tlmColor.blue.includes(value)) {
      return tlmColorBlueStyle;
    } else {
      return tlmNormalStyle;
    }
  }

  const showTlmData = (tlm: Telemetry) => {
    const tlmClasses = tlm.telemetryInfo.name.split('.');
    const tlmClassesDisplayed: JSX.Element[] = [];
    if (tlmClasses.length == 1) {
      tlmClassesDisplayed.push(
        <li key={tlm.telemetryInfo.name} style={tlmliStyle}>
          {tlm.telemetryInfo.name} : <span style={setClassName(tab.dataType, tlm.telemetryValue.value)}>{(tab.dataType != "Raw") ? tlm.telemetryValue.value : tlm.telemetryValue.rawValue}</span>
        </li>
      )
      tlmClassList.push(tlm.telemetryInfo.name);
    } else {
      const thisTlmClasses: string[] = [];
      tlmClasses.forEach((tlmName, i) => {
        let tlmClassesTmp = (i == 0) ? tlmName : tlmClasses.slice(0, i + 1).join(".");
        if (i == tlmClasses.length - 1) {
          tlmClassesDisplayed.push(
            <li key={tlm.telemetryInfo.name} style={tlmliStyle}>
              {<span style={{ marginRight: `${10 * i}px` }}></span>}
              {tlmName} : <span style={setClassName(tab.dataType, tlm.telemetryValue.value)}>{(tab.dataType != "Raw") ? tlm.telemetryValue.value : tlm.telemetryValue.rawValue}</span>
            </li>
          )
        } else if (!tlmClassList.includes(tlmClassesTmp)) {
          tlmClassesDisplayed.push(
            <li key={tlm.telemetryInfo.name} style={setTlmTagColor(i)}>
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
    <div style={{ padding: 10 }}>
      <Toolbar>
        <FormControl component="fieldset">
          <Toolbar>
            <FormLabel component="legend" sx={dataTypeFieldStyle}>Data Type</FormLabel>
            <RadioGroup aria-label="data-type" name="data-type" value={dataType} onChange={handleChange}>
              <Toolbar>
                <FormControlLabel value="Default" control={<Radio />} label="Default" />
                <FormControlLabel value="Raw" control={<Radio />} label="Raw" />
              </Toolbar>
            </RadioGroup>
          </Toolbar>
        </FormControl>
        <div style={titleWithSpaceStyle}>
          <span style={titleStyle}>Name : </span>{tab.name}
        </div>
        <div style={titleWithSpaceStyle}>
          <span style={titleStyle}>Apid : </span> 0x{Number(tab.tlmApid).toString(16)}
        </div>
        <div style={titleWithOutSpaceStyle}>
          <span style={titleStyle}>Packet Id : </span> 0x{Number(tab.packetId).toString(16)}
        </div>
        <Button onClick={handleOk} color="primary">
          SET
        </Button>
        <IconButtonInTabs onClick={handleDialogOpen}>
          <CenterFocusStrongIcon fontSize="small" />
        </IconButtonInTabs>
      </Toolbar>
      <OpenPacketTabDialog
        blockNum={blockNum}
        keepMounted
        open={dialogOpen}
        tab={tab}
        onClose={handleDialogClose}
      />
      <Grid
        container
        spacing={2}
      >
        <Grid item sx={itemStyle}>
          {tlmsDisplayed.filter((tlm, i) => i < num / 3)
            .map(tlm => (
              showTlmData(tlm)
            ))}
        </Grid>
        <Grid item sx={itemStyle}>
          {tlmsDisplayed.filter((tlm, i) => i >= num / 3 && i < 2 * num / 3)
            .map((tlm => (
              showTlmData(tlm)
            )))}
        </Grid>
        <Grid item sx={itemStyle}>
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
