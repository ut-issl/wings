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

  const handleExecTimeChange = (event: any) => {
    const newSelectedCommand = {
      ...command,
      execTime: parseInt(event.target.value)
    }
    dispatch(selectedCommandEditAction(newSelectedCommand));
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
            {(command.execType === "TL" || command.execType === "BL" || command.execType === "UTL") && (
              <TableRow>
                <TableCell className={classes.nameCell}>Time</TableCell>
                <TableCell className={classes.valueCell} style={{padding: 0}}>
                  <TextField
                    label="" onChange={handleExecTimeChange}
                    value={(command.execTime == 0) ? 0 : (command.execTime || "")} type="text"
                    className={classes.valueInput}
                  />
                </TableCell>
                <TableCell className={classes.typeCell}>int32_t</TableCell>
                <TableCell>TI</TableCell>
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
