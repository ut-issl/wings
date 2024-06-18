import React from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Command } from '../../../models';
import { useDispatch } from 'react-redux';
import { selectedCommandEditAction } from '../../../redux/plans/actions';

export interface SetParamAreaProps {
  command: Command
}

const SetParamTable = (props: SetParamAreaProps) => {
  const dispatch = useDispatch();
  const { command } = props;
  const [execTime, setExecTime] = React.useState<string>();
  const [execType, setExecType] = React.useState<string>();

  const tableStyle = {
    "& .MuiTableCell-root": {
      padding: 1
    }
  };
  const nameCellStyle = { width: 50, padding: 0 };
  const valueCellStyle = { width: 100, padding: 0 };
  const typeCellStyle = { width: 60, padding: 0 };
  const descriptionCellStyle = { width: 60, padding: 0 };
  const valueInputStyle = { "& input": { padding: 1 }, padding: 0 };

  if (command.execType != execType) {
    if (command.execType == "RT") {
      const newSelectedCommand = {
        ...command,
        execTimeInt: 0,
        execTimeDouble: 0,
        execTimeStr: ""
      }
      setExecTime('0');
      setExecType(command.execType);
      dispatch(selectedCommandEditAction(newSelectedCommand));
    }
    else if (command.execType == 'TL' || command.execType == 'BL') {
      var execTimeInt = (execTime == undefined) ? '0' : execTime;
      const newSelectedCommand = {
        ...command,
        execTimeInt: parseInt(execTimeInt),
        execTimeDouble: 0,
        execTimeStr: execTimeInt
      }
      setExecTime('0');
      setExecTime(isNaN(parseInt(execTimeInt)) ? '0' : String(parseInt(execTimeInt)));
      setExecType(command.execType);
      dispatch(selectedCommandEditAction(newSelectedCommand));
    }
    else if (command.execType == 'UTL') {
      var execTimeDouble = (execTime == undefined) ? '0' : execTime;
      if (execTimeDouble.slice(-1) !== '.') {
        const newSelectedCommand = {
          ...command,
          execTimeInt: 0,
          execTimeDouble: parseFloat(execTimeDouble),
          execTimeStr: execTimeDouble
        }
        setExecTime(isNaN(parseFloat(execTimeDouble)) ? '0' : String(parseFloat(execTimeDouble)));
        dispatch(selectedCommandEditAction(newSelectedCommand));
      }
      else if (execTimeDouble.slice(-2) !== '.') {
        setExecTime(execTimeDouble);
      }
      setExecType(command.execType);
    }
  }

  const handleExecTimeChange = (event: any) => {
    const newSelectedCommand = {
      ...command,
      execTimeInt: parseInt(event.target.value),
      execTimeDouble: 0,
      execTimeStr: event.target.value.toString()
    }
    setExecTime(isNaN(parseInt(event.target.value)) ? '0' : String(parseInt(event.target.value)));
    dispatch(selectedCommandEditAction(newSelectedCommand));
  };

  const handleExecUnixTimeChange = (event: any) => {
    if (event.target.value.slice(-1) !== '.') {
      const newSelectedCommand = {
        ...command,
        execTimeInt: 0,
        execTimeDouble: parseFloat(event.target.value),
        execTimeStr: event.target.value.toString()
      }
      setExecTime(isNaN(parseFloat(event.target.value)) ? '0' : String(parseFloat(event.target.value)));
      dispatch(selectedCommandEditAction(newSelectedCommand));
    }
    else if (event.target.value.indexOf('.') == event.target.value.length - 1) {
      setExecTime(event.target.value);
    }
  };

  const handleParamValueChange = (event: any, i: number) => {
    const newSelectedCommand = {
      ...command,
      params: [
        ...command.params.slice(0, i),
        {
          ...command.params[i],
          value: event.target.value
        },
        ...command.params.slice(i + 1)
      ]
    }
    dispatch(selectedCommandEditAction(newSelectedCommand));
  };

  return (
    <div>
      <Typography>
        Parameters
      </Typography>
      <div className="module-spacer--extra-extra-small" />
      <TableContainer component={Paper}>
        <Table sx={tableStyle}>
          <TableHead>
            <TableRow>
              <TableCell sx={nameCellStyle}>Name</TableCell>
              <TableCell sx={valueCellStyle}>Value</TableCell>
              <TableCell sx={typeCellStyle}>Type</TableCell>
              <TableCell sx={descriptionCellStyle}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(command.execType === "TL" || command.execType === "BL") && (
              <TableRow>
                <TableCell sx={nameCellStyle}>Time</TableCell>
                <TableCell sx={valueCellStyle}>
                  <TextField
                    label="" onChange={handleExecTimeChange}
                    value={(execTime === '') ? '0' : (execTime || '')} type="text"
                    sx={valueInputStyle}
                  />
                </TableCell>
                <TableCell sx={typeCellStyle}>int32_t</TableCell>
                <TableCell>TI</TableCell>
              </TableRow>
            )}
            {(command.execType === "UTL") && (
              <TableRow>
                <TableCell sx={nameCellStyle}>Time</TableCell>
                <TableCell sx={valueCellStyle}>
                  <TextField
                    label="" onChange={handleExecUnixTimeChange}
                    value={(execTime === '') ? '0' : (execTime || '')} type="text"
                    sx={valueInputStyle}
                  />
                </TableCell>
                <TableCell sx={typeCellStyle}>int32_t</TableCell>
                <TableCell>UnixTime</TableCell>
              </TableRow>
            )}
            {command.params.length > 0 && (
              command.params.map((param, i) =>
                <TableRow key={i}>
                  <TableCell sx={nameCellStyle}>{param.name}</TableCell>
                  <TableCell sx={valueCellStyle}>
                    <TextField
                      label="" onChange={(event) => handleParamValueChange(event, i)}
                      value={param.value || ""} type="text"
                      sx={valueInputStyle}
                    />
                  </TableCell>
                  <TableCell sx={typeCellStyle}>{param.type}</TableCell>
                  <TableCell>{param.description}</TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
};

export default SetParamTable;
