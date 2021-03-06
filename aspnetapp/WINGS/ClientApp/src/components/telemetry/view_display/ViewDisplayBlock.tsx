import React from 'react';
import { useDispatch } from 'react-redux';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ViewTabPanel from './ViewTabPanel';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import IconButtonInTabs from '../../common/IconButtonInTabs';
import { ViewBlockInfo } from '../../../models';
import { activateViewAction, closeViewAction } from '../../../redux/views/actions';
import OpenViewDialog from './OpenViewDialog';

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    root: {
      [theme.breakpoints.down('lg')]: {
        width: '100%'
      },
      [theme.breakpoints.up('lg')]: {
        width: 'calc(50% - 1rem)'
      },
      "& .MuiTab-root": {
        minWidth: 100
      },
      minHeight: 'calc(50vh - 4.5rem)',
      margin: 2,
      borderStyle: "solid",
      borderColor: theme.palette.primary.light,
      borderWidth: "0px 1px 1px 1px"
    },
    tab: {
      width: 120,
      minHeight: "auto",
      textAlign: "left",
      padding: "0",
      "& span": {
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
    },
    dialogPaper: {
      width: '80%',
      maxHeight: 435,
    },
}));

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
  const classes = useStyles();
  const dispatch = useDispatch();
  const value = blockInfo.activeTab;

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
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs value={value} onChange={handleValueChange}>
          {blockInfo.tabs.map((tab,i) => (
            <Tab
              key={i} label={tab.name} {...a11yProps(i)} className={classes.tab}
              icon={<CloseIconInTab onClick={() => closeView(i)}/>}
            />
          ))}
          <IconButtonInTabs onClick={handleDialogOpen}>
            <AddIcon fontSize="small"/>
          </IconButtonInTabs>
        </Tabs>
      </AppBar>
      {blockInfo.tabs.length > 0 ? (
        blockInfo.tabs.map((tab,i) => (
          <ViewTabPanel key={i} value={value} index={i} tab={tab} blockNum={blockNum} />
        ))
      ) : (
        <div></div>
      )}
      <OpenViewDialog
        blockNum={blockNum}
        classes={{ paper: classes.dialogPaper }}
        keepMounted
        open={dialogOpen}
        onClose={handleDialogClose}
      />
    </div>
  );
};

export default ViewDisplayBlock;
