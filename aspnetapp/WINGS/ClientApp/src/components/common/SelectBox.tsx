import React from 'react';
import { InputLabel, MenuItem, FormControl, Select } from "@mui/material"

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
    marginBottom: 16,
    minWidth: 128,
    width: '100%'
  };

  return (
    <FormControl sx={formControlStyle}>
      <InputLabel>{props.label}</InputLabel>
      <Select
        value={props.value}
        onChange={(event) => { props.select(event.target.value) }}
      >
        {props.options.map((option: SelectOption) => (
          <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )
};

export default SelectBox;

