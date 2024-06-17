import React, { useEffect, useState } from 'react';
import { createStyles, makeStyles } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store/RootState';
import { getCommands, getTargets, getComponents } from '../../../redux/commands/selectors';
import SelectBox, { SelectOption } from '../../common/SelectBox';
import CheckBox from '../../common/CheckBox';
import { selectedCommandEditAction, selectedCommandCommitAction, selectedTargetEditAction, selectedComponentEditAction } from '../../../redux/plans/actions';
import { getSelectedCommand } from '../../../redux/plans/selectors';
import { TARGET_ALL, COMPONENT_ALL } from '../../../constants';
import SetParamTable from './SetParamTable';
import Select from 'react-select';
import { SingleValue, ActionMeta } from 'react-select/dist/declarations/src';

const useStyles = makeStyles(
  createStyles({
    root: {
      marginLeft: 20,
      width: 500
    },
    button: {
      width: 120
    },
    commandName: {
      fontSize: '9pt',
      color: 'rgba(255, 255, 255, 0.7)'
    }
  }));

const execTypeOptions: SelectOption[] = ["RT", "TL", "BL", "UTL"].map(type => ({ id: type, name: type }));

const CommandSelectionArea = () => {
  const classes = useStyles();
  const selector = useSelector((state: RootState) => state);
  const dispatch = useDispatch();

  const commands = getCommands(selector);
  const targets = getTargets(selector);
  const components = getComponents(selector);
  const { component, target, command } = getSelectedCommand(selector);

  interface OptionType {
    label: string,
    value: string
  };

  const [commandOptions, setCommandOptions] = useState<OptionType[]>([]);

  const targetOptions: SelectOption[] = targets.map(target => ({ id: target, name: target }));

  const componentOptions: SelectOption[] = components.map(component => ({ id: component, name: component }));

  useEffect(() => {
    let options: OptionType[] = [];
    commands.map((command, i) => {
      (target === TARGET_ALL || command.target === target) && (component === COMPONENT_ALL || command.component === component) &&
        options.push({ label: command.name, value: String(i) })
    });
    setCommandOptions(options);
  }, [component, target]);

  const handleComponentChange = (component: string) => {
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
      execTimeInt: NaN,
      execTimeDouble: NaN,
      execTimeStr: ""
    };
    dispatch(selectedCommandEditAction(newSelectedCommand));
  };

  const handleTargetChange = (target: string) => {
    dispatch(selectedTargetEditAction(target));
  }

  const handleCommandChange = (newValue: SingleValue<OptionType>, actionMeta: ActionMeta<OptionType>) => {
    if (newValue != null && actionMeta.action == 'select-option') {
      const index: number = +newValue.value;
      const newSelectedCommand = {
        ...commands[index],
        execType: command.execType,
        execTimeInt: command.execTimeInt,
        execTimeDouble: command.execTimeDouble,
        execTimeStr: command.execTimeStr,
        isViaMobc: command.isViaMobc
      }
      dispatch(selectedCommandEditAction(newSelectedCommand));
    }
  }

  const customStyles = {
    control: (base: any) => ({
      ...base,
      background: '#A8A8A8',
      borderColor: '#424242',
      boxShadow: null,
    }),
    menu: (base: any) => ({
      ...base,
      borderRadius: 0,
      marginTop: 0
    }),
    menuList: (base: any) => ({
      ...base,
      padding: 0,
      background: 'rgba(255, 255, 255, 0.7)',
      color: '#424242',
      // "&:hover": {
      //   background: '#000000'
      // }
    })
  };

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
        <div className="module-spacer--extra-extra-small" />
        <SelectBox
          label="Target" options={targetOptions}
          select={handleTargetChange} value={target}
        />
        <div className="module-spacer--extra-extra-small" />
        <div className={classes.commandName}>Command Name</div>
        <Select
          styles={customStyles}
          onChange={handleCommandChange}
          options={commandOptions}
        />
        <div className="module-spacer--extra-extra-small" />
        <Typography>
          {command.description}
        </Typography>
        <div className="module-spacer--extra-extra-small" />
        <SetParamTable command={command} />
        <div className="module-spacer--small" />
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
