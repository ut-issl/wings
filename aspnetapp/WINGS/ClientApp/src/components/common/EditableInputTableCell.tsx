import React from 'react';
import TextField from '@mui/material/TextField';
import TableCell from '@mui/material/TableCell';

export interface EditableInputTableCellProps {
  isEditMode: boolean,
  name: string,
  value: string
  label: string,
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void,
}

const EditableInputTableCell = (props: EditableInputTableCellProps) => {
  const { isEditMode, label, name, value, onChange } = props;
  const valueInputStyle = { "& input": { padding: 8, maxWidth: 120 } };

  return (
    <TableCell>
      {isEditMode ? (
        <TextField
          label="" onChange={(event) => onChange(event)}
          name={name} value={value} type="text"
          sx={valueInputStyle}
        />
      ) : (
        label
      )}
    </TableCell>
  )
};

export default EditableInputTableCell;
