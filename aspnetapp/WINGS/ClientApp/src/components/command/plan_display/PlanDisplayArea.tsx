import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Tooltip from '@material-ui/core/Tooltip';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store/RootState';
import { getOpenedPlanIndexes, getOpenedPlanIds, getActivePlanId, getPlanContents, getInExecution } from '../../../redux/plans/selectors';
import { activatePlanAction, closePlanAction } from '../../../redux/plans/actions';
import OpenPlanDialog from './OpenPlanDialog';
import PlanTabPanel from './PlanTabPanel';
import IconButtonInTabs from '../../common/IconButtonInTabs';
import { UNPLANNED_ID } from '../../../constants';

const useStyles = makeStyles(
  createStyles({
    root: {
      display: 'flex',
      height: 820,
    },
    tabs: {
      borderRight: "1px solid",
      width: 230
    },
    tab: {
      width: 220,
      minHeight: "auto",
      textAlign: "left",
      padding: "6px 0 6px 0",
      "& span": {
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
        display: "inline-block",
        flexGrow: 0
      },
      "& .MuiTab-wrapper > *:first-child": {
        marginBottom: 0,
        padding: "0 5px 0 5px"
      }
    },
    dialogPaper: {
      width: '80%',
      maxHeight: 435,
    },
    planTab: {
      width: 700
    }
}));

const a11yProps = (index: any) => {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const PlanDisplayArea = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const selector = useSelector((state: RootState) => state);
  
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const openedIds = getOpenedPlanIds(selector);
  const planIndexes = getOpenedPlanIndexes(selector);
  const activePlanId = getActivePlanId(selector);
  const planContents = getPlanContents(selector);
  const inExecution = getInExecution(selector);
  const value = openedIds.indexOf(activePlanId);

  const handleDialogOpen = () => {
    if (!inExecution) {
      setDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleValueChange = (event: React.ChangeEvent<{}>, value: number) => {
    // 自動実行中はタブ切り替えを受け付けない
    if (!inExecution) {
      dispatch(activatePlanAction(openedIds[value]));
    }
  };

  const closePlan = (id: string) => {
    dispatch(closePlanAction(id));
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

  if (activePlanId=="_unplanned"){
    return (
      <div className={classes.root}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value < 0 ? false : value}
          onChange={handleValueChange}
          className={classes.tabs}
        >          
          {planIndexes.length > 0 && (
            planIndexes.map((index,i) => (
              index.id === UNPLANNED_ID ?
              <Tab
                key={index.id} label={index.name} {...a11yProps(i)} className={classes.tab}
                style={{paddingLeft: "30px"}}
              />
              : (<Tooltip key={index.id} title={index.name} placement="right">
                <Tab
                  label={index.name} {...a11yProps(i)} className={classes.tab}
                  icon={<CloseIconInTab onClick={() => closePlan(index.id)}/>}
                />
              </Tooltip>)
            ))
          )}
          <IconButtonInTabs onClick={handleDialogOpen}>
            <AddIcon />
          </IconButtonInTabs>
        </Tabs>
        <div className={classes.planTab} >
          {planIndexes.length > 0 && (
            planIndexes.map((index,i) => (
              <PlanTabPanel key={index.id} value={value} index={i} name={index.name} content={planContents[index.id]} />
            ))
          )}
        </div>
        
        <OpenPlanDialog
          classes={{ paper: classes.dialogPaper }}
          keepMounted
          open={dialogOpen}
          onClose={handleDialogClose}
        />
              
      </div>
    );
  } else{
    return (
      <div className={classes.root}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value < 0 ? false : value}
          onChange={handleValueChange}
          className={classes.tabs}
        >
          
          {planIndexes.length > 0 && (
            planIndexes.map((index,i) => (
              index.id === UNPLANNED_ID ?
              <Tab
                key={index.id} label={index.name} {...a11yProps(i)} className={classes.tab}
                style={{paddingLeft: "30px"}}
              />
              : (<Tooltip key={index.id} title={index.name} placement="right">
                <Tab
                  label={index.name} {...a11yProps(i)} className={classes.tab}
                  icon={<CloseIconInTab onClick={() => closePlan(index.id)}/>}
                />
              </Tooltip>)
            ))
          )}
          <IconButtonInTabs onClick={handleDialogOpen}>
            <AddIcon />
          </IconButtonInTabs>
        </Tabs>
        <div className={classes.planTab} >
          {planIndexes.length > 0 && (
            planIndexes.map((index,i) => (
              <PlanTabPanel key={index.id} value={value} index={i} name={index.name} content={planContents[index.id]} />
            ))
          )}
        </div>
          
        <OpenPlanDialog
          classes={{ paper: classes.dialogPaper }}
          keepMounted
          open={dialogOpen}
          onClose={handleDialogClose}
        />
              
      </div>
    );
  }
}

export default PlanDisplayArea;
