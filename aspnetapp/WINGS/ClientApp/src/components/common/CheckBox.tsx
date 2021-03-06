import React from 'react';
import { Checkbox, FormControlLabel } from "@material-ui/core"

export interface CheckBoxProps {
  label: string,
  checked: boolean,
  select: any
};

const CheckBox = (props: CheckBoxProps) => {
  return (
    <FormControlLabel
      control={<Checkbox checked={props.checked} onChange={(event) => { props.select(event.target.checked) }}/>}
      label={props.label}
    />
  )
};

export default CheckBox;

