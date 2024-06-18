import React from 'react';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store/RootState';
import { getOpenedPlanIndexes, getOpenedPlanIds, getActivePlanId, getPlanContents, getInExecution } from '../../../redux/plans/selectors';
import { activatePlanAction, closePlanAction } from '../../../redux/plans/actions';
import OpenPlanDialog from './OpenPlanDialog';
import PlanTabPanel from './PlanTabPanel';
import IconButtonInTabs from '../../common/IconButtonInTabs';
import { UNPLANNED_ID } from '../../../constants';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Toolbar from '@mui/material/Toolbar';
import { getCmdType } from '../../../redux/plans/selectors';
import { setCmdTypeAction } from '../../../redux/plans/actions';

const a11yProps = (index: any) => {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const PlanDisplayArea = () => {
  const dispatch = useDispatch();
  const selector = useSelector((state: RootState) => state);

  const planTabStyle = {
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
    },
  };
  const cmdFileField = {
    fontSize: "10pt",
    textAlign: "center"
  };

  const tabsStyle = {
    borderRight: "1px solid",
    width: 230
  };

  const [dialogOpen, setDialogOpen] = React.useState(false);

  const openedIds = getOpenedPlanIds(selector);
  const planIndexes = getOpenedPlanIndexes(selector);
  const activePlanId = getActivePlanId(selector);
  const planContents = getPlanContents(selector);
  const inExecution = getInExecution(selector);
  const value = openedIds.indexOf(activePlanId);
  const [cmdType, setCmdType] = React.useState(getCmdType(selector));

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let cmdType = (event.target as HTMLInputElement).value
    setCmdType(cmdType);
    dispatch(setCmdTypeAction(cmdType));
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

  if (activePlanId == "_unplanned") {
    return (
      <div style={{ display: 'flex', height: 820 }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value < 0 ? false : value}
          onChange={handleValueChange}
          style={tabsStyle}
        >
          {planIndexes.length > 0 && (
            planIndexes.map((index, i) => (
              index.id === UNPLANNED_ID ?
                <Tab
                  key={index.id} label={index.name} {...a11yProps(i)} sx={planTabStyle}
                  style={{ paddingLeft: "30px" }}
                />
                : (<Tooltip key={index.id} title={index.name} placement="right">
                  <Tab
                    label={index.name} {...a11yProps(i)} sx={planTabStyle}
                    icon={<CloseIconInTab onClick={() => closePlan(index.id)} />}
                  />
                </Tooltip>)
            ))
          )}
          <IconButtonInTabs onClick={handleDialogOpen}>
            <AddIcon />
          </IconButtonInTabs>
        </Tabs>
        <div style={{ width: 700 }}>
          <FormControl component="fieldset">
            <Toolbar>
              <FormLabel component="legend" sx={cmdFileField}>Data Type</FormLabel>
              <RadioGroup aria-label="data-type" name="data-type" value={cmdType} onChange={handleChange}>
                <Toolbar>
                  <FormControlLabel value="Type-A" control={<Radio />} label="Type-A" />
                  <FormControlLabel value="Type-B" control={<Radio />} label="Type-B" />
                </Toolbar>
              </RadioGroup>
            </Toolbar>
          </FormControl>
          {planIndexes.length > 0 && (
            planIndexes.map((index, i) => (
              <PlanTabPanel key={index.id} value={value} index={i} name={index.name} content={planContents[index.id]} cmdType={cmdType} />
            ))
          )}
        </div>

        <OpenPlanDialog
          keepMounted
          open={dialogOpen}
          onClose={handleDialogClose}
        />

      </div>
    );
  } else {
    return (
      <div style={{ display: 'flex', height: 820, }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value < 0 ? false : value}
          onChange={handleValueChange}
          sx={tabsStyle}
        >

          {planIndexes.length > 0 && (
            planIndexes.map((index, i) => (
              index.id === UNPLANNED_ID ?
                <Tab
                  key={index.id} label={index.name} {...a11yProps(i)} sx={planTabStyle}
                  style={{ paddingLeft: "30px" }}
                />
                : (<Tooltip key={index.id} title={index.name} placement="right">
                  <Tab
                    label={index.name} {...a11yProps(i)} sx={planTabStyle}
                    icon={<CloseIconInTab onClick={() => closePlan(index.id)} />}
                  />
                </Tooltip>)
            ))
          )}
          <IconButtonInTabs onClick={handleDialogOpen}>
            <AddIcon />
          </IconButtonInTabs>
        </Tabs>
        <div style={{ width: 700 }} >
          <FormControl component="fieldset">
            <Toolbar>
              <FormLabel component="legend" sx={cmdFileField}>Data Type</FormLabel>
              <RadioGroup aria-label="data-type" name="data-type" value={cmdType} onChange={handleChange}>
                <Toolbar>
                  <FormControlLabel value="Type-A" control={<Radio />} label="Type-A" />
                  <FormControlLabel value="Type-B" control={<Radio />} label="Type-B" />
                </Toolbar>
              </RadioGroup>
            </Toolbar>
          </FormControl>
          {planIndexes.length > 0 && (
            planIndexes.map((index, i) => (
              <PlanTabPanel key={index.id} value={value} index={i} name={index.name} content={planContents[index.id]} cmdType={cmdType} />
            ))
          )}
        </div>

        <OpenPlanDialog
          keepMounted
          open={dialogOpen}
          onClose={handleDialogClose}
        />

      </div>
    );
  }
}

export default PlanDisplayArea;
