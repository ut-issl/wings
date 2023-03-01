import React, { useRef } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Button, TextField } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { CommandPlanLine, RequestStatus, CmdFileVariable } from '../../../models';
import RequestTableRow from './RequestTableRow';
import { selectedPlanRowAction, execRequestSuccessAction, execRequestErrorAction, execRequestsStartAction, execRequestsEndAction, cmdFileVariableEditAction } from '../../../redux/plans/actions';
import { getActivePlanId, getAllIndexes, getInExecution, getPlanContents, getSelectedRow, getCommandFileVariables } from '../../../redux/plans/selectors';
import { useDispatch, useSelector } from 'react-redux';
import { openPlan, postCommand, postCommandFileLineLog } from '../../../redux/plans/operations';
import { RootState } from '../../../redux/store/RootState';
import { getLatestTelemetries } from '../../../redux/telemetries/selectors';
import { openErrorDialogAction } from '../../../redux/ui/actions';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import { Dialog } from '@material-ui/core';
import { getOpid } from '../../../redux/operations/selectors';
import { finishEditCommandLineAction } from '../../../redux/plans/actions';

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
    },
    button: {
      width: 120
    },
    activeTab: {
      height: 700,
      zIndex: 99,
      position: "absolute",
      backgroundColor: "#212121"
    },
    inactiveTab: {
      height: 700,
      zIndex: 1,
      position: "absolute",
      backgroundColor: "#212121"
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

  const opid = getOpid(selector);
  const activePlanId = getActivePlanId(selector);

  const [showModal, setShowModal] = React.useState(false);
  const [text, setText] = React.useState("");
  const [num, setNum] = React.useState(0);
  const [cmdFileVariables, setCmdFileVariables] = React.useState<CmdFileVariable[]>(getCommandFileVariables(selector));

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

  interface GetVariable {
    value: string | number,
    isSuccess: boolean,
    convType: string
  }

  const advanceSelectedRow = (nextRow: number) => {
    selectedRow < content.length-1 && dispatch(selectedPlanRowAction(nextRow));
    if (container && tbody && tbody.getElementsByTagName('tr')[0] != undefined) {
      const trHeight = tbody.getElementsByTagName('tr')[0].clientHeight;
      const top = Math.ceil(container.scrollTop/trHeight);
      if ((nextRow - top) > 15) {
        container.scrollTop += trHeight;
      }     
    }
  };

  const backSelectedRow = (nextRow: number) => {
    selectedRow > 0 && dispatch(selectedPlanRowAction(nextRow));
    if (container && tbody && tbody.getElementsByTagName('tr')[0] != undefined) {
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

  const handleChangeCmdLine = (e: any) => {
    setText(() => e.target.value)
  }

  const editCmdline = async (i: number) => {
    const res = await fetch(`/api/operations/${opid}/cmd_plans/0/${activePlanId}/${i}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const json = await res.json();
    if (res.status === 200) {
      const data = json.data;
      //dispatch(editCommandLineAction(num, data));
      setText(data);
    } else {
      const message = `Status Code: ${res.status}\n${json.message ? json.message: "unknown error"}`;
      dispatch(openErrorDialogAction(message));
    }
    setNum(() => i+1);
    setShowModal(true);
  }

  const finishEditting = async () => {
    // do things like LoadCommandFileAsync
    const res = await fetch(`/api/operations/${opid}/cmd_plans/0/${activePlanId}/${num-1}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({text: text})
    });
    const json = await res.json();
    if (res.status === 200) {
      const commandFileLine = json.data;
      dispatch(finishEditCommandLineAction(num-1, commandFileLine));
    } else {
      const message = `Status Code: ${res.status}\n${json.message ? json.message: "unknown error"}`;
      dispatch(openErrorDialogAction(message));
    }
    setShowModal(false);
  }

  const setCmdline = async (row: number, cmdlineText: string) => {
    // do things like LoadCommandFileAsync
    const res = await fetch(`/api/operations/${opid}/cmd_plans/0/${activePlanId}/${row}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({text: cmdlineText})
    });
    const json = await res.json();
    if (res.status === 200) {
      const commandFileLine = json.data;
      dispatch(finishEditCommandLineAction(row, commandFileLine));
    } else {
      const message = `Status Code: ${res.status}\n${json.message ? json.message: "unknown error"}`;
      dispatch(openErrorDialogAction(message));
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

  const getVariableValue = (variableName: string) => {
    let variableIndex = -1;
    let outcome: GetVariable = { value: NaN, isSuccess: false, convType: "" };
    if (variableName.toLowerCase() == "unixtime_now") {
      outcome.value = Math.floor(new Date().getTime() / 1000);
      outcome.isSuccess = true;
    } else if (cmdFileVariables.findIndex(index => index.variable === variableName) >= 0) {
      variableIndex = cmdFileVariables.findIndex(index => index.variable === variableName);
      outcome.value = cmdFileVariables[variableIndex].value;
      outcome.isSuccess = true;
    } else if (variableName.indexOf('.') > -1) {
      var tlms = getLatestTelemetries(selector)[variableName.split('.')[0]];
      if (tlms.findIndex(index => index.telemetryInfo.name === variableName) >= 0) {
        variableIndex = tlms.findIndex(index => index.telemetryInfo.name === variableName);
      } else if (tlms.findIndex(index => index.telemetryInfo.name === variableName.split('.').slice(1).join('.')) >= 0) {
        variableIndex = tlms.findIndex(index => index.telemetryInfo.name === variableName.split('.').slice(1).join('.'));
      } else {
        return outcome;
      }
      outcome.value = parseTlmValue(tlms[variableIndex].telemetryValue.value, tlms[variableIndex].telemetryInfo.convType);
      outcome.isSuccess = true;
      outcome.convType = tlms[variableIndex].telemetryInfo.convType;
    }
    return outcome;
  }

  const compareValue = (compare: string, variable: GetVariable, refValue: string) => {
    let comparedValue = (refValue.indexOf("{") == -1) ? refValue 
                      : getVariableValue(refValue.substring(refValue.indexOf("{") + 1, refValue.indexOf("}"))).value.toString();
    switch (compare) {
      case "==":
        if (variable.value === parseTlmValue(comparedValue, variable.convType)) {
          return true;
        } else {
          return false;
        }
      case ">=":
        if (variable.value >= parseTlmValue(comparedValue, variable.convType)) {
          return true;
        } else {
          return false;
        }
      case "<=":
        if (variable.value <= parseTlmValue(comparedValue, variable.convType)) {
          return true;
        } else {
          return false;
        }
      case ">":
        if (variable.value > parseTlmValue(comparedValue, variable.convType)) {
          return true;
        } else {
          return false;
        }
      case "<":
        if (variable.value < parseTlmValue(comparedValue, variable.convType)) {
          return true;
        } else {
          return false;
        }
      case "!=":
        if (variable.value !== parseTlmValue(comparedValue, variable.convType)) {
          return true;
        } else {
          return false;
        }
      case "in":
        while (refValue.indexOf("{") != -1) {
          let cmdFileVar = refValue.substring(refValue.indexOf("{") + 1, refValue.indexOf("}"));
          let varValue = getVariableValue(cmdFileVar);
          if (!varValue.isSuccess) {
            return false;
          }
          refValue = refValue.replace("{" + cmdFileVar + "}", varValue.value.toString());
        }
        let valueLower = parseTlmValue(refValue.substring(refValue.indexOf("[") + 1, refValue.indexOf(",")), variable.convType);
        let valueUpper = parseTlmValue(refValue.substring(refValue.indexOf(",") + 1, refValue.indexOf("]")), variable.convType);
        if (variable.value >= valueLower && variable.value <= valueUpper) {
          return true;
        } else {
          return false;
        }
      default:
        return false;
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
        let paramsValue = [];
        
        if (req.body.execTimeStr == null) {
          req.body.execTimeStr = "";
        }
        else if (req.body.execTimeStr.indexOf("{") != -1) {
          let varTi = req.body.execTimeStr.substring(req.body.execTimeStr.indexOf("{") + 1,
                                                     req.body.execTimeStr.indexOf("}"));
          let tiValue = getVariableValue(varTi);

          if (!tiValue.isSuccess) {
            dispatch(execRequestErrorAction(row));
            return false;
          }

          if (req.body.execType == "TL" || req.body.execType == "BL") {
            req.body.execTimeInt = tiValue.value;
          } else if (req.body.execType == "UTL") {
            req.body.execTimeDouble = tiValue.value;
          } else {
            dispatch(execRequestErrorAction(row));
            return false;
          }
        }

        if (req.body.params.length != 0) {
          for (let i = 0; i < req.body.params.length; i++) {
            if (req.body.params[i].value.indexOf("{") != -1) {
              let varStart = req.body.params[i].value.indexOf("{") + 1;
              let varEnd = req.body.params[i].value.indexOf("}");
              let varParam = req.body.params[i].value.substring(varStart, varEnd);
              let varValue = getVariableValue(varParam);

              if (!varValue.isSuccess) {
                dispatch(execRequestErrorAction(row));
                return false;
              } else {
                paramsValue.push(varValue.value.toString());
              }
              
            } else {
              paramsValue.push(req.body.params[i].value);
            }
          }
        }
        await dispatch(postCommand(row, req, paramsValue, commandret));
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

      case "wait_until":
        var timer = 0;
        var timeoutsec = (req.body.timeoutsec == "" || isNaN(req.body.timeoutsec)) ? 10 : Number(req.body.timeoutsec);
        while (!reqret && timer < timeoutsec) {
          let latestTlmValue = getVariableValue(req.body.variable);
          if (!latestTlmValue.isSuccess) {
            break;
          }

          if(compareValue(req.body.compare, latestTlmValue, req.body.value)) {
            reqret = true;
          } else {
            await _sleep(1000);
            timer += 1;
          }
        }
        if (reqret) {
          dispatch(execRequestSuccessAction(row));
        } else {
          dispatch(execRequestErrorAction(row));
        }
        break;

      case "check_value":
        let tlmValue = getVariableValue(req.body.variable);
        if (!tlmValue.isSuccess) {
          break;
        }

        if (compareValue(req.body.compare, tlmValue, req.body.value)) {
          dispatch(execRequestSuccessAction(row));
          reqret = true;
        } else {
          dispatch(execRequestErrorAction(row));
          reqret = false;
        }
        break;
      
      case "let":
        var equ = req.body.equation;
        // const innerVar = tlms[tlmidx];
        // const val = parseTlmValue(innerVar.telemetryValue.value, innerVar.telemetryInfo.convType);
        reqret = true;
        while (equ.indexOf("{") != -1) {
          let cmdFileVar = equ.substring(equ.indexOf("{") + 1, equ.indexOf("}"));
          let varValue = getVariableValue(cmdFileVar);
          if (!varValue.isSuccess) {
            dispatch(execRequestErrorAction(row));
            return false;
          }
          equ = equ.replace("{" + cmdFileVar + "}", varValue.value.toString());
        }
        let equAns;
        try {
          equAns = eval(equ);
        }
        catch (e) {
          equAns = equ;
        }
        var cmdFileVariablesTemp = cmdFileVariables;
        if (cmdFileVariables.findIndex(index => index.variable === req.body.variable) >= 0) {
          var varIndex = cmdFileVariables.findIndex(index => index.variable === req.body.variable)
          cmdFileVariablesTemp[varIndex].value = equAns;
        } else {
          cmdFileVariablesTemp.push({variable: req.body.variable, value: equAns});
        }
        setCmdFileVariables(cmdFileVariablesTemp);
        dispatch(execRequestSuccessAction(row));
        dispatch(cmdFileVariableEditAction(cmdFileVariablesTemp));
        break;
      
      case "get":
        let reqValue = getVariableValue(req.body.variable).value;
        let newText = (req.stopFlag ? "." : " ") + `${req.method} ${req.body.variable} ${reqValue}`;
        setCmdline(row, newText);
        dispatch(execRequestSuccessAction(row));
        reqret = true;
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

  return (
    <>
      <div className={(value !== index) ? classes.inactiveTab : classes.activeTab}>
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
                  <TableCell style={{width: "120px", padding: "0"}}/>
                </TableRow>
              </TableHead>
              <TableBody id="plan-table-body">
                {content.length > 0 && (
                  content.map((line, i) => (
                    <RequestTableRow
                      key={i} line={line} index={i} isSelected={i === selectedRow}
                      onClick={() => handleRowClick(i)}
                      onDoubleClick={() => {editCmdline(i)}}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Dialog
            disableBackdropClick
            disableEscapeKeyDown
            maxWidth="md"
            aria-labelledby="edit-commandLine"
            open={showModal}
            keepMounted={true}
          >
            <DialogTitle id="edit-commandLine">Edit Command Line</DialogTitle>
            <DialogContent dividers>
              <p>You can edit the selected command line.</p>
            </DialogContent>
            <DialogActions>
              <TextField
                label="edit" onChange={handleChangeCmdLine}
                value={text} type="text" style={{width: 940}}
              />
            </DialogActions>
            <DialogActions>
              <Button
                variant="contained" color="primary" className={classes.button}
                onClick={()=>{setShowModal(false)}}
              >
                Cancel
              </Button> 
              <Button
                variant="contained" color="primary" className={classes.button}
                onClick={finishEditting}
              >
                Update
              </Button> 
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </>
  );
}

export default PlanTabPanel;
