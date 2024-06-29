import React from 'react';
import { Checkbox, FormControlLabel } from "@mui/material"

export interface CheckBoxProps {
  label: string,
  checked: boolean,
  select: (checked: boolean) => void
}

const CheckBox = (props: CheckBoxProps) => {
  return (
    <FormControlLabel
      control={<Checkbox checked={props.checked} onChange={(event) => { props.select(event.target.checked) }} />}
      label={props.label}
    />
  )
};

export default CheckBox;

