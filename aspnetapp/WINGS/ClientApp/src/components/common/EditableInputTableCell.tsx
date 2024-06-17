import React from 'react';
import { createStyles, makeStyles } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import TableCell from '@mui/material/TableCell';

const useStyles = makeStyles(
  createStyles({
    valueInput: {
      "& input": {
        padding: 8,
        maxWidth: 120
      }
    },
  }));

export interface EditableInputTableCellProps {
  isEditMode: boolean,
  name: string,
  value: string
  label: string,
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => any,
};

const EditableInputTableCell = (props: EditableInputTableCellProps) => {
  const { isEditMode, label, name, value, onChange } = props;
  const classes = useStyles();

  return (
    <TableCell>
      {isEditMode ? (
        <TextField
          label="" onChange={(event) => onChange(event)}
          name={name} value={value} type="text"
          className={classes.valueInput}
        />
      ) : (
        label
      )}
    </TableCell>
  )
};

export default EditableInputTableCell;
