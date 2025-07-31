import React from 'react';
import IconButton from '@mui/material/IconButton';

export interface IconButtonInTabsProps {
  children: React.ReactNode,
  className?: string | undefined,
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

const IconButtonInTabs = (props: IconButtonInTabsProps) => {
  return <IconButton className={props.className} onClick={props.onClick}>{props.children}</IconButton>
}

export default IconButtonInTabs;
