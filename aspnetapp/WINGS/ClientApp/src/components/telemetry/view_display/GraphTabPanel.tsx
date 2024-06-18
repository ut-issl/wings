import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TelemetryViewIndex } from '../../../models';
import { RootState } from '../../../redux/store/RootState';
import { getTelemetryHistories } from '../../../redux/telemetries/selectors';
import { Line } from 'react-chartjs-2';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import IconButtonInTabs from '../../common/IconButtonInTabs';
import OpenGraphTabDialog from './OpenGraphTabDialog';
import Toolbar from '@mui/material/Toolbar';
import { TextField } from '@mui/material';
import Button from '@mui/material/Button';
import { setTelemetryTypeGraphAction } from '../../../redux/views/actions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Dialog } from '@mui/material';

export interface GraphTabPanelProps {
  tab: TelemetryViewIndex,
  blockNum: number
}

const GraphTabPanel = (props: GraphTabPanelProps) => {
  const { tab, blockNum } = props;
  const selector = useSelector((state: RootState) => state);
  const dispatch = useDispatch();
  const telemetryHistories = getTelemetryHistories(selector);

  const [dataType, setDataType] = React.useState(tab.dataType);
  const [dataLength, setDataLength] = React.useState(tab.dataLength);
  const [ylabelMin, setYlabelMin] = React.useState(tab.ylabelMin);
  const [ylabelMax, setYlabelMax] = React.useState(tab.ylabelMax);

  const [showModal, setShowModal] = React.useState(false);

  const dataTypeFieldStyle = {
    fontSize: "10pt",
    textAlign: "center"
  };
  const inputDataStyle = {
    width: "3cm",
    fontSize: "10pt"
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
  const dialogPaperStyle = JSON.stringify({
    width: '80%',
    maxHeight: 435,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDataType((event.target as HTMLInputElement).value);
  };

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const graphColor: { backgroundColor: string; borderColor: string; }[] = [
    { backgroundColor: "#008080", borderColor: "#7fffd4" },
    { backgroundColor: "#1e90ff", borderColor: "#87cefa" },
    { backgroundColor: "#b8860b", borderColor: "#ffd700" },
    { backgroundColor: "#c71585", borderColor: "#ee82ee" },
    { backgroundColor: "#483d8b", borderColor: "#8a2be2" },
    { backgroundColor: "#800000", borderColor: "#b22222" },
    { backgroundColor: "#f65200", borderColor: "#ff9966" },
    { backgroundColor: "#808080", borderColor: "#dcdcdc" },
    { backgroundColor: "#0000cd", borderColor: "#1e90ff" },
    { backgroundColor: "#ff8989", borderColor: "#ff4343" },
  ];

  let tlmData: { [id: string]: number[] } = {};
  let tlmLabels: { [id: string]: string[] } = {};
  const items: { label: string; backgroundColor: string; borderColor: string; pointBorderWidth: number; data: number[]; }[] = [];

  const inputDataLength = React.useCallback((event: any) => {
    setDataLength(event.target.value)
  }, [setDataLength]);

  const inputYlabelMin = React.useCallback((event: any) => {
    if (!isNaN(Number(event.target.value))) {
      setYlabelMin(event.target.value);
    }
    else {
      setYlabelMin('');
    }
  }, [setYlabelMin]);

  const inputYlabelMax = React.useCallback((event: any) => {
    if (!isNaN(Number(event.target.value))) {
      setYlabelMax(event.target.value);
    }
    else {
      setYlabelMax('');
    }
  }, [setYlabelMax]);

  let maxValue: number = 0;
  let minValue: number = 0;
  let isFirstValueSet = false;

  tab.selectedTelemetries.forEach((telemetryName, index) => {
    const selectedTelemetryHistory = telemetryHistories[tab.compoName][tab.name].find(element => element.telemetryInfo.name == telemetryName);
    if (selectedTelemetryHistory != undefined) {
      let tlmDataTmp: number[] = [];
      let tlmLabelTmp: string[] = [];
      selectedTelemetryHistory.telemetryValues.forEach(tlm => {
        if (tab.dataType != "Raw") {
          tlmDataTmp.push(Number(tlm.value));
        }
        else {
          tlmDataTmp.push(Number(tlm.rawValue));
        }
        tlmLabelTmp.push(tlm.time);
      })

      if ((Number(tab.dataLength) !== 0 || NaN) && (tlmDataTmp.length >= Number(tab.dataLength))) {
        tlmData[telemetryName] = tlmDataTmp.slice(tlmDataTmp.length - Number(tab.dataLength), tlmDataTmp.length);
        tlmLabels[telemetryName] = tlmLabelTmp.slice(tlmDataTmp.length - Number(tab.dataLength), tlmDataTmp.length);
      }
      else {
        tlmData[telemetryName] = tlmDataTmp;
        tlmLabels[telemetryName] = tlmLabelTmp;
      }

      if (!isFirstValueSet && !isNaN(tlmData[telemetryName][0])) {
        maxValue = tlmData[telemetryName].reduce((num1, num2) => Math.max(num1, num2));
        minValue = tlmData[telemetryName].reduce((num1, num2) => Math.min(num1, num2));
        isFirstValueSet = true;
      }
      else if (!isNaN(tlmDataTmp[0])) {
        let tempMaxValue = tlmData[telemetryName].reduce((num1: number, num2: number) => Math.max(num1, num2));
        let tempMinValue = tlmData[telemetryName].reduce((num1: number, num2: number) => Math.min(num1, num2));
        maxValue = Math.max(maxValue, tempMaxValue);
        minValue = Math.min(minValue, tempMinValue);
      }
    }

    items.push(
      {
        label: telemetryName,
        backgroundColor: graphColor[index % graphColor.length].backgroundColor,
        borderColor: graphColor[index % graphColor.length].borderColor,
        pointBorderWidth: 1,
        data: tlmData[telemetryName]
      })
  });

  const handleDialogOpen = () => {
    setDialogOpen(true);
  }

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleOk = () => {
    if (
      isNaN(Number(ylabelMin))
      || isNaN(Number(ylabelMax))
      || (
        Number(ylabelMin) != 0
        && (
          (Number(ylabelMax) == 0 && Number(ylabelMin) >= maxValue)
          || (Number(ylabelMax) != 0 && Number(ylabelMin) >= Number(ylabelMax))
        )
      )
      || (
        Number(ylabelMax) != 0
        && (Number(ylabelMin) == 0 && Number(ylabelMax) <= minValue)
      )
    ) {
      setShowModal(true);
    }
    else {
      dispatch(setTelemetryTypeGraphAction(blockNum, dataType, dataLength, ylabelMin, ylabelMax));
    }
  };

  const data = {
    labels: tlmLabels[tab.selectedTelemetries[0]],
    datasets: items
  }

  const options = {
    // animation: false,
    // scales: {
    //   xAxes: [{
    //     type: "time",
    //     time: {
    //       parser: 'YYYY-MM-DD HH:mm:ss.S',
    //       unit: 'minute',
    //       stepSize: 1,
    //     }
    //   }],
    //   yAxes: {
    //     min: (tab.ylabelMin != '') ? Number(tab.ylabelMin) : null,
    //     max: (tab.ylabelMax != '') ? Number(tab.ylabelMax) : null
    //   }
    // }
  }

  return (
    <div style={{ padding: 10 }}>
      <div style={titleWithSpaceStyle}>
        <span style={titleStyle}>Name : </span>{tab.name}
      </div>
      <div style={titleWithSpaceStyle}>
        <span style={titleStyle}>Apid : </span> 0x{Number(tab.tlmApid).toString(16)}
      </div>
      <div style={titleWithOutSpaceStyle}>
        <span style={titleStyle}>Packet Id : </span> 0x{Number(tab.packetId).toString(16)}
      </div>
      <Toolbar>
        <TextField
          label="Data Length" onChange={inputDataLength}
          sx={inputDataStyle}
          value={dataLength} type="text"
        />
        <TextField
          label="y Label Min" onChange={inputYlabelMin}
          sx={inputDataStyle}
          value={ylabelMin} type="text"
        />
        <TextField
          label="y Label Max" onChange={inputYlabelMax}
          sx={inputDataStyle}
          value={ylabelMax} type="text"
        />
        <FormControl component="fieldset">
          <FormLabel component="legend" sx={dataTypeFieldStyle}>Data Type</FormLabel>
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
          <CenterFocusStrongIcon fontSize="small" />
        </IconButtonInTabs>
      </Toolbar>
      <OpenGraphTabDialog
        blockNum={blockNum}
        classes={{ paper: dialogPaperStyle }}
        keepMounted
        open={dialogOpen}
        tab={tab}
        onClose={handleDialogClose}
      />
      <Line
        data={data}
        options={options}
      />
      <Dialog
        disableEscapeKeyDown
        maxWidth="xs"
        aria-labelledby="confirmation-ylabel"
        open={showModal}
        keepMounted={true}
      >
        <DialogTitle id="confirmation-ylabel">Error</DialogTitle>
        <DialogContent dividers>
          <p>Error in y axis settings</p>
        </DialogContent>
        <DialogActions>
          <Button size="large" onClick={() => setShowModal(false)} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
};

export default GraphTabPanel;
