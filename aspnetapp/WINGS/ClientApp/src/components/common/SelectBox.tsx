import React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export interface SelectOption {
  id: any,
  name: string
};

export interface SelectBoxProps {
  label: string,
  value: any,
  select: any,
  options: SelectOption[]
};

const SelectBox = (props: SelectBoxProps) => {
  const formControlStyle = {
    minWidth: 128,
    width: '100%'
  };

  return (
    <FormControl sx={formControlStyle}>
      <InputLabel>{props.label}</InputLabel>
      <Select
        value={props.value}
        label={props.label}
        onChange={(event: SelectChangeEvent) => { props.select(event.target.value) }}
      >
        {props.options.map((option: SelectOption) => (
          <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )
};

export default SelectBox;

