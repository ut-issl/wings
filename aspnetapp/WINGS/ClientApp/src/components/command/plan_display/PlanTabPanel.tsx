import React, { useRef } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { CommandPlanLine, RequestStatus } from '../../../models';
import RequestTableRow from './RequestTableRow';
import { selectedPlanRowAction, execRequestSuccessAction, execRequestErrorAction, execRequestsStartAction, execRequestsEndAction } from '../../../redux/plans/actions';
import { getAllIndexes, getInExecution, getSelectedRow } from '../../../redux/plans/selectors';
import { useDispatch, useSelector } from 'react-redux';
import { openPlan, postCommand, postCommandFileLineLog } from '../../../redux/plans/operations';
import { RootState } from '../../../redux/store/RootState';
import { getLatestTelemetries } from '../../../redux/telemetries/selectors';

const useStyles = makeStyles(
  createStyles({
    container: {
      width: 700,
      maxHeight: 700,
    },
    tableEventShifter: {
      position: "absolute",
      zIndex: -10,
      outline: 0
    }
}));

const _sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface PlanTabPanelProps {
  value: number,
  index: number,
  name: string,
  content: CommandPlanLine[]
}

const PlanTabPanel = (props: PlanTabPanelProps) => {
  const {value, index, name, content } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const selector = useSelector((state: RootState) => state);

  const [lastSelectedRow, setLastSelectedRow] = React.useState(-1);

  let selectedRow = getSelectedRow(selector);

  if (index == value && selectedRow != lastSelectedRow) {
    if (selectedRow == -1) {
      if (lastSelectedRow >= 0) {
        selectedRow = lastSelectedRow;
        dispatch(selectedPlanRowAction(selectedRow));
      } else {
        setLastSelectedRow(selectedRow);
      }
    }
    else {
      setLastSelectedRow(selectedRow);
    }
  }
  const allIndexes = getAllIndexes(selector);
  const inExecution = getInExecution(selector);

  const textInput = useRef() as React.MutableRefObject<HTMLInputElement>;

  const container = document.getElementById('plan-table-container');
  const tbody = document.getElementById('plan-table-body');

  const advanceSelectedRow = (nextRow: number) => {
    selectedRow < content.length-1 && dispatch(selectedPlanRowAction(nextRow));
    if (container && tbody) {
      const trHeight = tbody.getElementsByTagName('tr')[0].clientHeight;
      const top = Math.ceil(container.scrollTop/trHeight);
      if ((nextRow - top) > 15) {
        container.scrollTop += trHeight;
      }     
    }
  };

  const backSelectedRow = (nextRow: number) => {
    selectedRow > 0 && dispatch(selectedPlanRowAction(nextRow));
    if (container && tbody) {
      const trHeight = tbody.getElementsByTagName('tr')[0].clientHeight;
      const top = Math.ceil(container.scrollTop/trHeight);
      if ((nextRow - top) < 4) {
        container.scrollTop -= trHeight;
      }     
    }
  };

  const handleTableClick = () => {
    textInput.current.focus();
  }

  const handleRowClick = (i: number) => {
    if (inExecution) return;
    dispatch(selectedPlanRowAction(i));
  };

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (inExecution) return;
    if (event.key === 'ArrowDown') {
      advanceSelectedRow(selectedRow+1);
    } else if (event.key === 'ArrowUp') {
      backSelectedRow(selectedRow-1);
    }
    if (event.key === 'Enter' && event.shiftKey) {
      dispatch(execRequestsStartAction());
      await executeMultipleRequests()
      dispatch(execRequestsEndAction());
    }
  }

  const executeMultipleRequests = async () => {
    let row = selectedRow;
    do {
      const exeret = await executeRequest(row);
      await sendCmdFileLine(row, exeret);
      if (content[row].request.method == "call") {
        break;
      }
      row += 1;
      advanceSelectedRow(row);
    } while (row < content.length && !content[row].request.stopFlag)
    if (row === content.length) {
      dispatch(selectedPlanRowAction(-1));
    }
  }

  const executeRequest = async (row: number): Promise<boolean> => {
    const req = content[row].request;
    let exeret = false;
    switch (req.type) {
      case "comment":
        await dispatch(execRequestSuccessAction(row));
        exeret = true;
        break;
      
      case "command":
        let commandret = [false];
        await dispatch(postCommand(row, req, commandret));
        exeret = commandret[0];
        break;

      case "control":
        let controlret = await executeControlRequest(row);
        exeret = controlret;
        break;

      default:
        break;
    }
    return exeret;
  }

  const executeControlRequest = async (row: number): Promise<boolean> => {
    const req = content[row].request;
    let reqret = false;
    switch (req.method) {
      case "wait_sec":
        await _sleep(req.body.time * 1000);
        dispatch(execRequestSuccessAction(row));
        reqret = true;
        break;
      
      case "call":
        const fileName = req.body.fileName;
        const ret = allIndexes.findIndex(index => index.name === fileName);
        if (ret !== -1) {
          dispatch(execRequestSuccessAction(row));
          dispatch(openPlan(allIndexes[ret].id));
          reqret = true;
        } else {
          dispatch(execRequestErrorAction(row));
          reqret = false;
        }
        break;

      case "check_value":
        const tlms = getLatestTelemetries(selector)[req.body.variable.split('.')[0]];
        var tlmidx = -1;
        if (tlms.findIndex(index => index.telemetryInfo.name === req.body.variable) >= 0) {
          tlmidx = tlms.findIndex(index => index.telemetryInfo.name === req.body.variable);
        } else if (tlms.findIndex(index => index.telemetryInfo.name === req.body.variable.split('.').slice(1).join('.')) >= 0) {
          tlmidx = tlms.findIndex(index => index.telemetryInfo.name === req.body.variable.split('.').slice(1).join('.'));
        } else {
          break;
        }
        const tlm = tlms[tlmidx];
        const tlmValue = parseTlmValue(tlm.telemetryValue.value, tlm.telemetryInfo.convType);
        const comparedValue = parseTlmValue(req.body.value, tlm.telemetryInfo.convType);
        switch (req.body.compare) {
          case "==":
            if (tlmValue === comparedValue) {
              dispatch(execRequestSuccessAction(row));
              reqret = true;
            } else {
              dispatch(execRequestErrorAction(row));
              reqret = false;
            }
            break;
          case ">=":
            if (tlmValue >= comparedValue) {
              dispatch(execRequestSuccessAction(row));
              reqret = true;
            } else {
              dispatch(execRequestErrorAction(row));
              reqret = false;
            }
            break;
          case "<=":
            if (tlmValue <= comparedValue) {
              dispatch(execRequestSuccessAction(row));
              reqret = true;
            } else {
              dispatch(execRequestErrorAction(row));
              reqret = false;
            }
            break;
          case ">":
            if (tlmValue > comparedValue) {
              dispatch(execRequestSuccessAction(row));
              reqret = true;
            } else {
              dispatch(execRequestErrorAction(row));
              reqret = false;
            }
            break;
          case "<":
            if (tlmValue < comparedValue) {
              dispatch(execRequestSuccessAction(row));
              reqret = true;
            } else {
              dispatch(execRequestErrorAction(row));
              reqret = false;
            }
            break;
          case "!=":
            if (tlmValue !== comparedValue) {
              dispatch(execRequestSuccessAction(row));
              reqret = true;
            } else {
              dispatch(execRequestErrorAction(row));
              reqret = false;
            }
            break;
          default:
            dispatch(execRequestErrorAction(row));
            reqret = false;
            break;
        }
        break;
    
      default:
        break;
    }
    return reqret;
  };

  const parseTlmValue = (value: string, convType: string) => {
    switch (convType) {
      case "NONE":
        return Number(value);
      case "POLY":
        return Number(value);
      case "STATUS":
        return value;
      case "HEX":
        return value;
      default:
        return value;
    }
  }

  const sendCmdFileLine = async (row: number, ret: boolean) => {
    const status_tmp: RequestStatus = (ret) ? { success: true, error: false } : { success: false, error: true };
    const content_tmp: CommandPlanLine = { request: content[row].request, status: status_tmp };
    await dispatch(postCommandFileLineLog(content_tmp));
  }

  if (value !== index) {
    return <></>
  };

  return (
    <div
      role="tabpanel"
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
    >
      <input
        type="text"
        className={classes.tableEventShifter}
        style={{backgroundColor: "red"}}
        ref={textInput}
        onKeyDown={(event) => handleKeyDown(event)}
        readOnly
      >
      </input>
      <TableContainer className={classes.container} id="plan-table-container">
        <Table stickyHeader onClick={handleTableClick}>
          <TableHead>
            <TableRow>
              <TableCell style={{width: "40px", padding: "0"}}/>
              <TableCell style={{width: "27px", padding: "0"}}/>
              <TableCell style={{fontWeight: "bold"}}>{name}</TableCell>
              <TableCell style={{width: "40px", padding: "0"}}/>
            </TableRow>
          </TableHead>
          <TableBody id="plan-table-body">
            {content.length > 0 && (
              content.map((line, i) => (
                <RequestTableRow
                  key={i} line={line} index={i} isSelected={i === selectedRow}
                  onClick={() => handleRowClick(i)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default PlanTabPanel;
