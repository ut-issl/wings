import React from 'react';
import {InputLabel, MenuItem, FormControl, Select, makeStyles, createStyles} from "@material-ui/core"

const useStyles = makeStyles(createStyles({
  formControl: {
    marginBottom: 16,
    minWidth: 128,
    width: '100%'
  }
}));

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
  const classes = useStyles();

  return (
    <FormControl className={classes.formControl}>
      <InputLabel>{props.label}</InputLabel>
      <Select
        value={props.value}
        onChange={(event) => {props.select(event.target.value)}}
      >
        {props.options.map((option: SelectOption) => (
          <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )
};

export default SelectBox;

