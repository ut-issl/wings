import React from 'react';
import { useDispatch } from 'react-redux';
import { Theme, styled, useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ViewTabPanel from './ViewTabPanel';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import IconButtonInTabs from '../../common/IconButtonInTabs';
import { ViewBlockInfo } from '../../../models';
import { activateViewAction, closeViewAction } from '../../../redux/views/actions';
import OpenViewDialog from './OpenViewDialog';
import { root } from '../../..';
import { grey } from '@mui/material/colors';

const ViewDisplayContent = styled('div')(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    width: '100%'
  },
  [theme.breakpoints.up('lg')]: {
    width: 'calc(50% - 1rem)'
  },
  "& .MuiTab-root": {
    width: 120
  },
  minHeight: 'calc(50vh - 4.5rem)',
  margin: 2,
  borderStyle: "solid",
  borderColor: theme.palette.primary.light,
  borderWidth: "0px 1px 1px 1px"
}));

const DisplayTab = styled(Tab)({
  width: '100%',
  minHeight: "auto",
  textAlign: "left",
  overflow: "hidden",
  textOverflow: "ellipsis",
  padding: "0",
  border: 0,
  "&.Mui-selected": {
    "& span": {
      color: "white"
    }
  },
  "& span": {
    color: grey[300],
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
    display: "inline-block",
    flexGrow: 0
  },
  "& .MuiTab-wrapper > *:first-child": {
    marginBottom: 0,
    padding: 0,
    marginRight: 15,
    marginLeft: 5,
    width: 20,
    height: 20
  }
})

const a11yProps = (index: any) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export interface ViewDisplayBlockProps {
  blockInfo: ViewBlockInfo,
  blockNum: number
}

const ViewDisplayBlock = (props: ViewDisplayBlockProps) => {
  const { blockInfo, blockNum } = props;
  const dispatch = useDispatch();
  const value = blockInfo.activeTab;
  const theme: Theme = useTheme();

  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  }

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleValueChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    dispatch(activateViewAction(blockNum, newValue))
  };

  const closeView = (tab: number) => {
    dispatch(closeViewAction(blockNum, tab))
  }

  interface CloseIconInTabProps {
    onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  }

  const CloseIconInTab = (props: CloseIconInTabProps) => {
    return (
      <IconButton onClick={props.onClick}>
        <CloseIcon fontSize="small" />
      </IconButton>
    );
  };

  return (
    <ViewDisplayContent theme={theme}>
      <AppBar position="static">
        <Tabs value={value} onChange={handleValueChange}>
          {blockInfo.tabs.map((tab, i) => (
            <DisplayTab
              key={i} label={<span>{tab.name}</span>} {...a11yProps(i)}
              icon={<CloseIconInTab onClick={() => closeView(i)} />}
              iconPosition="start"
            />
          ))}
          <IconButtonInTabs onClick={handleDialogOpen}>
            <AddIcon fontSize="small" />
          </IconButtonInTabs>
        </Tabs>
      </AppBar>
      {blockInfo.tabs.length > 0 ? (
        blockInfo.tabs.map((tab, i) => (
          <ViewTabPanel key={i} value={value} index={i} tab={tab} blockNum={blockNum} />
        ))
      ) : (
        <div></div>
      )}
      <OpenViewDialog
        blockNum={blockNum}
        keepMounted
        open={dialogOpen}
        onClose={handleDialogClose}
      />
    </ViewDisplayContent>
  );
};

export default ViewDisplayBlock;
