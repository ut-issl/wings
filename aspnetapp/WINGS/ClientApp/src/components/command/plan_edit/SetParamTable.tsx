import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Command } from '../../../models';
import { useDispatch } from 'react-redux';
import { selectedCommandEditAction } from '../../../redux/plans/actions';

const useStyles = makeStyles(
  createStyles({
    table: {
      "& .MuiTableCell-root": {
        padding: 8
      }
    },
    nameCell: {
      width: 50
    },
    valueCell: {
      width: 150
    },
    typeCell: {
      width: 60
    },
    valueInput: {
      "& input": {
        padding: 8
      }
    },
}));

export interface SetParamAreaProps {
  command: Command
}

const SetParamTable = (props: SetParamAreaProps) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { command } = props;
  const [execTime, setExecTime] = React.useState<string>();
  const [execType, setExecType] = React.useState<string>();

  if (command.execType != execType)
  {
    if (command.execType == "RT")
    {
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
    else if (command.execType == 'TL' || command.execType == 'BL')
    {
      var execTimeInt = (execTime==undefined)?'0':execTime;
      const newSelectedCommand = {
        ...command,
        execTimeInt: parseInt(execTimeInt),
        execTimeDouble: 0,
        execTimeStr: execTimeInt
      }
      setExecTime('0');
      setExecTime(isNaN(parseInt(execTimeInt))?'0':String(parseInt(execTimeInt)));
      setExecType(command.execType);
      dispatch(selectedCommandEditAction(newSelectedCommand));
    }
    else if (command.execType == 'UTL')
    {
      var execTimeDouble = (execTime==undefined)?'0':execTime;
      if (execTimeDouble.slice(-1) !== '.')
      {
        const newSelectedCommand = {
          ...command,
          execTimeInt: 0,
          execTimeDouble: parseFloat(execTimeDouble),
          execTimeStr: execTimeDouble
        }
        setExecTime(isNaN(parseFloat(execTimeDouble))?'0':String(parseFloat(execTimeDouble)));
        dispatch(selectedCommandEditAction(newSelectedCommand));
      }
      else if (execTimeDouble.slice(-2) !== '.')
      {
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
    setExecTime(isNaN(parseInt(event.target.value))?'0':String(parseInt(event.target.value)));
    dispatch(selectedCommandEditAction(newSelectedCommand));
  };

  const handleExecUnixTimeChange = (event: any) => {
    if (event.target.value.slice(-1) !== '.')
    {
      const newSelectedCommand = {
        ...command,
        execTimeInt: 0,
        execTimeDouble: parseFloat(event.target.value),
        execTimeStr: event.target.value.toString()
      }
      setExecTime(isNaN(parseFloat(event.target.value))?'0':String(parseFloat(event.target.value)));
      dispatch(selectedCommandEditAction(newSelectedCommand));
    }
    else if (event.target.value.indexOf('.') == event.target.value.length-1) 
    {
      setExecTime(event.target.value);
    }
  };

  const handleParamValueChange = (event: any, i: number) => {
    const newSelectedCommand = {
      ...command,
      params: [
        ...command.params.slice(0,i),
        {
          ...command.params[i],
          value: event.target.value
        },
        ...command.params.slice(i+1)
      ]
    }
    dispatch(selectedCommandEditAction(newSelectedCommand));
  };

  return (
    <div>
      <Typography>
        Parameters
      </Typography>
      <div className="module-spacer--extra-extra-small"/>
      <TableContainer component={Paper}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.nameCell}>Name</TableCell>
              <TableCell className={classes.valueCell}>Value</TableCell>
              <TableCell className={classes.typeCell}>Type</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {(command.execType === "TL" || command.execType === "BL") && (
              <TableRow>
                <TableCell className={classes.nameCell}>Time</TableCell>
                <TableCell className={classes.valueCell} style={{padding: 0}}>
                  <TextField
                    label="" onChange={handleExecTimeChange}
                    value={(execTime === '') ? '0' : (execTime || '')} type="text"
                    className={classes.valueInput}
                  />
                </TableCell>
                <TableCell className={classes.typeCell}>int32_t</TableCell>
                <TableCell>TI</TableCell>
              </TableRow>
            )}
            {(command.execType === "UTL") && (
              <TableRow>
                <TableCell className={classes.nameCell}>Time</TableCell>
                <TableCell className={classes.valueCell} style={{padding: 0}}>
                  <TextField
                    label="" onChange={handleExecUnixTimeChange}
                    value={(execTime === '') ? '0' : (execTime || '')} type="text"
                    className={classes.valueInput}
                  />
                </TableCell>
                <TableCell className={classes.typeCell}>int32_t</TableCell>
                <TableCell>UnixTime</TableCell>
              </TableRow>
            )}
            {command.params.length > 0 && (
              command.params.map((param,i) => 
                <TableRow key={i}>
                  <TableCell className={classes.nameCell}>{param.name}</TableCell>
                  <TableCell className={classes.valueCell} style={{padding: 0}}>
                    <TextField
                      label="" onChange={(event) => handleParamValueChange(event, i)}
                      value={param.value || ""} type="text"
                      className={classes.valueInput}
                    />
                  </TableCell>
                  <TableCell className={classes.typeCell}>{param.type}</TableCell>
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
