import React, { useEffect, useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store/RootState';
import { getCommands, getTargets, getComponents } from '../../../redux/commands/selectors';
import SelectBox, { SelectOption } from '../../common/SelectBox';
import CheckBox from '../../common/CheckBox';
import { selectedCommandEditAction, selectedCommandCommitAction, selectedTargetEditAction, selectedComponentEditAction } from '../../../redux/plans/actions';
import { getSelectedCommand } from '../../../redux/plans/selectors';
import { TARGET_ALL, COMPONENT_ALL } from '../../../constants';
import SetParamTable from './SetParamTable';

const useStyles = makeStyles(
  createStyles({
    root: {
      marginLeft: 20,
      width: 500
    },
    button: {
      width: 120
    }
}));

const execTypeOptions: SelectOption[] = ["RT","TL","BL","UTL"].map(type => ({id: type, name: type}));

const CommandSelectionArea = () => {
  const classes = useStyles();
  const selector = useSelector((state: RootState) => state);
  const dispatch = useDispatch();

  const commands = getCommands(selector);
  const targets = getTargets(selector);
  const components = getComponents(selector);
  const { component, target, command } = getSelectedCommand(selector);
  
  const initIndexNum = commands.map(cmd => cmd.code).indexOf(command.code);
  const initIndex = initIndexNum < 0 ? "" : String(initIndexNum);
  const [commandIndex, setCommandIndex] = useState(initIndex);

  const [commandOptions, setCommandOptions] = useState<SelectOption[]>([]);

  const targetOptions: SelectOption[] = targets.map(target => ({ id: target, name: target }));

  const componentOptions: SelectOption[] = components.map(component => ({ id: component, name: component }));

  useEffect(() => {
    let options: SelectOption[] = [];
    commands.map((command, i) => {
      (target === TARGET_ALL || command.target === target) && (component === COMPONENT_ALL || command.component === component) &&
      options.push({id: String(i), name: command.name})
    });
    setCommandOptions(options);
  }, [component, target]);

  const handleComponentChange = (component: string) => {
    setCommandIndex("");
    dispatch(selectedComponentEditAction(component));
  }

  const handleIsViaMobcChange = (isViaMobc: boolean) => {
    const newSelectedCommand = {
      ...command,
      isViaMobc: isViaMobc
    };
    dispatch(selectedCommandEditAction(newSelectedCommand));
  }

  const handleExecTypeChange = (execType: string) => {
    const newSelectedCommand = {
      ...command,
      execType: execType,
      execTime: NaN
    };
    dispatch(selectedCommandEditAction(newSelectedCommand));
  };

  const handleTargetChange = (target: string) => {
    setCommandIndex("");
    dispatch(selectedTargetEditAction(target));
  }

  const handleCommandIndexChange = (commandIndex: string) => {
    setCommandIndex(commandIndex);
    const index: number = +commandIndex;
    const newSelectedCommand = {
      ...commands[index],
      execType: command.execType,
      execTime: command.execTime,
      isViaMobc: command.isViaMobc
    }
    dispatch(selectedCommandEditAction(newSelectedCommand));
  }

  const addUnplannedCommand = () => {
    if (command.name === "") return;
    if (command.params.map(param => param.value).every(value => value)) {
      dispatch(selectedCommandCommitAction());
    } 
  }

  return (
    <div className={classes.root}>
      <h2 className="u-text__headline">Command Selection</h2>
      <form className="p-content-next-headline p-gird__column">
        <SelectBox
          label="Component" options={componentOptions}
          select={handleComponentChange} value={component}
        />
        <CheckBox
          label="Use MOBC queue"
          checked={command.isViaMobc}
          select={handleIsViaMobcChange}
        />
        <div className="module-spacer--extra-extra-small" />
        <SelectBox
          label="Exec Type" options={execTypeOptions}
          select={handleExecTypeChange} value={command.execType}
        />
        <div className="module-spacer--extra-extra-small"/>
        <SelectBox
          label="Target" options={targetOptions}
          select={handleTargetChange} value={target}
        />
        <div className="module-spacer--extra-extra-small"/>
        <SelectBox
          label="Command Name" options={commandOptions}
          select={handleCommandIndexChange} value={commandIndex}
        />
        <div className="module-spacer--extra-extra-small"/>
        <Typography>
          {command.description}
        </Typography>
        <div className="module-spacer--extra-extra-small"/>
        <SetParamTable command={command} />
        <div className="module-spacer--small"/>
        <Button
          variant="contained" color="primary" className={classes.button}
          onClick={addUnplannedCommand}
        >
          Add
        </Button>
      </form>
    </div>
  )
}

export default CommandSelectionArea;
