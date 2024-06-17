import React from 'react';
import { FormLabel, FormControl, RadioGroup, FormControlLabel, Radio } from "@mui/material"

export interface RadioOption {
  id: string,
  name: string
}

export interface RadioBoxProps {
  label: string,
  value: string,
  handleChange: any,
  options: RadioOption[]
}

const RadioBox = (props: RadioBoxProps) => {
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend" style={{ color: "#fdfdfd" }}>{props.label}</FormLabel>
      <RadioGroup
        value={props.value}
        onChange={(event) => props.handleChange(event.target.value)}
      >
        {props.options.map(option => (
          <FormControlLabel key={option.id} value={option.id} control={<Radio />} label={option.name} />
        ))}
      </RadioGroup>
    </FormControl>
  )
};

export default RadioBox;
