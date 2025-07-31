import React from 'react';
import TableCell from '@mui/material/TableCell';
import SelectBox, { SelectOption } from './SelectBox';

export interface EditableSelectTableCellProps {
  isEditMode: boolean,
  value: any
  label: any,
  options: SelectOption[],
  select: any
};

const EditableSelectTableCell = (props: EditableSelectTableCellProps) => {
  const { isEditMode, value, label, select, options } = props;

  return (
    <TableCell>
      {isEditMode ? (
        <SelectBox
          label="" options={options}
          select={select} value={value}
        />
      ) : (
        label
      )}
    </TableCell>
  )
};

export default EditableSelectTableCell;
