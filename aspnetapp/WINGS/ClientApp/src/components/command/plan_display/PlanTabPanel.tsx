import React, { useRef } from 'react';
import { Button, TextField, styled } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { CommandPlanLine, RequestStatus, CmdFileVariable, Telemetry, TlmCmdConfigurationInfo, Command, RequestJson, CommandController } from '../../../models';
import RequestTableRow from './RequestTableRow';
import { selectedPlanRowAction, execRequestSuccessAction, execRequestErrorAction, execRequestsStartAction, execRequestsEndAction, editCmdFileVariableAction } from '../../../redux/plans/actions';
import { getActivePlanId, getAllIndexes, getInExecution, getPlanContents, getSelectedRow, getCommandFileVariables } from '../../../redux/plans/selectors';
import { useDispatch, useSelector } from 'react-redux';
import { openPlan, postCommand, postCommandFileLineLog } from '../../../redux/plans/operations';
import { RootState } from '../../../redux/store/RootState';
import { getLatestTelemetries } from '../../../redux/telemetries/selectors';
import { openErrorDialogAction } from '../../../redux/ui/actions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Dialog } from '@mui/material';
import { getOpid } from '../../../redux/operations/selectors';
import { finishEditCommandLineAction } from '../../../redux/plans/actions';
import { getTlmCmdConfig } from '../../../redux/operations/selectors';
import { AppDispatch } from '../../../redux/store/store';

const _sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface PlanTabPanelProps {
  value: number,
  index: number,
  name: string,
  content: CommandPlanLine[],
  cmdType: string
}

function isNotNull(value: string | null): value is string {
  return value !== null;
}

export interface TextJson {
  message: string,
  data: string
}

const PlanTabPanel = (props: PlanTabPanelProps) => {
  const { value, index, name, content, cmdType } = props;
  const dispatch = useDispatch<AppDispatch>();
  const selector = useSelector((state: RootState) => state);

  const [lastSelectedRow, setLastSelectedRow] = React.useState(-1);

  const opid = getOpid(selector);
  const activePlanId = getActivePlanId(selector);
  const tlmCmdConfig = getTlmCmdConfig(selector);

  const [showModal, setShowModal] = React.useState(false);
  const [text, setText] = React.useState("");
  const [num, setNum] = React.useState(0);
  const [cmdFileVariables, setCmdFileVariables] = React.useState<CmdFileVariable[]>(getCommandFileVariables(selector));

  let selectedRow = getSelectedRow(selector);

  if (index === value && selectedRow !== lastSelectedRow) {
    if (selectedRow === -1) {
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
    if (selectedRow < content.length - 1) {
      dispatch(selectedPlanRowAction(nextRow));
    }
    if (container && tbody && tbody.getElementsByTagName('tr')[0] !== undefined) {
      const trHeight = tbody.getElementsByTagName('tr')[0].clientHeight;
      const top = Math.ceil(container.scrollTop / trHeight);
      if ((nextRow - top) > 15) {
        container.scrollTop += trHeight;
      }
    }
  };

  const backSelectedRow = (nextRow: number) => {
    if (selectedRow > 0) {
      dispatch(selectedPlanRowAction(nextRow));
    }
    if (container && tbody && tbody.getElementsByTagName('tr')[0] !== undefined) {
      const trHeight = tbody.getElementsByTagName('tr')[0].clientHeight;
      const top = Math.ceil(container.scrollTop / trHeight);
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
      advanceSelectedRow(selectedRow + 1);
    } else if (event.key === 'ArrowUp') {
      backSelectedRow(selectedRow - 1);
    }
    if (event.key === 'Enter' && event.shiftKey) {
      dispatch(execRequestsStartAction());
      await executeMultipleRequests();
      dispatch(execRequestsEndAction());
    }
  }

  const handleKeyDownWrapper = (event: React.KeyboardEvent<HTMLDivElement>) => {
    handleKeyDown(event).catch(error => {
      console.error("Error handling key down event:", error);
    })
  }

  const handleChangeCmdLine = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  }

  const editCmdline = async (i: number) => {
    try {
      const res = await fetch(`/api/operations/${opid}/cmd_plans/0/${activePlanId}/${i}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const json = await res.json() as TextJson;
      if (res.status === 200) {
        const data = json.data;
        //dispatch(editCommandLineAction(num, data));
        setText(data);
      } else {
        const message = `Status Code: ${res.status}\n${json.message ? json.message : "unknown error"}`;
        dispatch(openErrorDialogAction(message));
      }
      setNum(i + 1);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching command line data:", error);
      dispatch(openErrorDialogAction("Failed to fetch command line data. Please try again."));
    }
  }

  const handleEditCmdline = (i: number) => {
    editCmdline(i).catch(error => {
      console.error("Error executing editCmdline:", error);
    });
  }

  const finishEditing = async () => {
    // do things like LoadCommandFileAsync
    const res = await fetch(`/api/operations/${opid}/cmd_plans/0/${activePlanId}/${num - 1}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: text })
    });
    const json = await res.json() as RequestJson;
    if (res.status === 200) {
      const commandFileLineRequest = json.data;
      dispatch(finishEditCommandLineAction({ row: num - 1, commandFileLineRequest: commandFileLineRequest }));
    } else {
      const message = `Status Code: ${res.status}\n${json.message ? json.message : "unknown error"}`;
      dispatch(openErrorDialogAction(message));
    }
    setShowModal(false);
  }

  const finishEditingWrapper = () => {
    finishEditing().catch(error => {
      console.error("Failed to fihish editing command fileline:", error);
    })
  }

  const setCmdline = async (row: number, cmdlineText: string) => {
    // do things like LoadCommandFileAsync
    const res = await fetch(`/api/operations/${opid}/cmd_plans/0/${activePlanId}/${row}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: cmdlineText })
    });
    const json = await res.json() as RequestJson;
    if (res.status === 200) {
      const commandFileLineRequest = json.data;
      dispatch(finishEditCommandLineAction({ row: row, commandFileLineRequest: commandFileLineRequest }));
    } else {
      const message = `Status Code: ${res.status}\n${json.message ? json.message : "unknown error"}`;
      dispatch(openErrorDialogAction(message));
    }
  }

  const executeMultipleRequests = async () => {
    let row = selectedRow;
    do {
      const exeret = await executeRequest(row, cmdType);
      sendCmdFileLine(row, exeret);
      if (content[row].request.method === "call") {
        break;
      }
      row += 1;
      advanceSelectedRow(row);
    } while (row < content.length && !content[row].request.stopFlag)
    if (row === content.length) {
      dispatch(selectedPlanRowAction(-1));
    }
  }

  const getVariableValue = (variableName: string): GetVariable => {
    let variableIndex = -1;
    const outcome: GetVariable = { value: 0, isSuccess: false, convType: "" };
    if (variableName.toLowerCase() === "unixtime_now") {
      outcome.value = Math.floor(new Date().getTime() / 1000);
      outcome.isSuccess = true;
    } else if (cmdFileVariables.findIndex(index => index.variable === variableName) >= 0) {
      variableIndex = cmdFileVariables.findIndex(index => index.variable === variableName);
      outcome.value = cmdFileVariables[variableIndex].value;
      outcome.isSuccess = true;
    } else if (variableName.indexOf('.') > -1) {
      let tlms: Telemetry[] = [];
      const latestTelemetries = getLatestTelemetries(selector);
      const variableNameSplitList = variableName.split('.');
      let tlmCmdConfigIndex = 0;
      try {
        tlms = latestTelemetries[variableNameSplitList[0]][variableNameSplitList[1]];
      } catch (e) {
        tlmCmdConfigIndex = tlmCmdConfig.findIndex(index => (latestTelemetries[index.compoName] !== undefined && latestTelemetries[index.compoName][variableNameSplitList[0]] !== undefined));
        if (tlmCmdConfigIndex !== -1) {
          tlms = latestTelemetries[tlmCmdConfig[tlmCmdConfigIndex].compoName][variableNameSplitList[0]];
        } else {
          tlms = latestTelemetries["MOBC"][variableNameSplitList[0]];
        }
      }
      if (tlms === undefined) {
        return outcome;
      } else if (tlms.findIndex(index => index.telemetryInfo.name === variableName) >= 0) {
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
    const comparedValue = (refValue.indexOf("{") === -1) ? refValue
      : getVariableValue(refValue.substring(refValue.indexOf("{") + 1, refValue.indexOf("}"))).value.toString();
    switch (compare) {
      case "==":
        return variable.value === parseTlmValue(comparedValue, variable.convType);
      case ">=":
        return variable.value >= parseTlmValue(comparedValue, variable.convType);
      case "<=":
        return variable.value <= parseTlmValue(comparedValue, variable.convType);
      case ">":
        return variable.value > parseTlmValue(comparedValue, variable.convType);
      case "<":
        return variable.value < parseTlmValue(comparedValue, variable.convType);
      case "!=":
        return variable.value !== parseTlmValue(comparedValue, variable.convType);
      case "in":
        while (refValue.indexOf("{") !== -1) {
          const cmdFileVar = refValue.substring(refValue.indexOf("{") + 1, refValue.indexOf("}"));
          const varValue = getVariableValue(cmdFileVar);
          if (!varValue.isSuccess) {
            return false;
          }
          refValue = refValue.replace("{" + cmdFileVar + "}", varValue.value.toString());
        }
        const valueLower = parseTlmValue(refValue.substring(refValue.indexOf("[") + 1, refValue.indexOf(",")), variable.convType);
        const valueUpper = parseTlmValue(refValue.substring(refValue.indexOf(",") + 1, refValue.indexOf("]")), variable.convType);
        return variable.value >= valueLower && variable.value <= valueUpper;
      default:
        return false;
    }
  }

  const executeRequest = async (row: number, cmdType: string): Promise<boolean> => {
    const req = content[row].request;
    let exeret = false;
    switch (req.type) {
      case "comment":
        dispatch(execRequestSuccessAction(row));
        exeret = true;
        break;

      case "command":
        const commandret = [false];
        const paramsValue: string[] = [];
        const command = req.body as Command;

        if ((command.execTimeStr != null) && (command.execTimeStr.indexOf("{") !== -1)) {
          const varTi = command.execTimeStr.substring(command.execTimeStr.indexOf("{") + 1,
            command.execTimeStr.indexOf("}"));
          const tiValue = getVariableValue(varTi);

          if (!tiValue.isSuccess) {
            dispatch(execRequestErrorAction(row));
            return false;
          }

          if (command.execType === "TL" || command.execType === "BL") {
            command.execTimeInt = Number(tiValue.value);
          } else if (command.execType === "UTL") {
            command.execTimeDouble = Number(tiValue.value);
          } else {
            dispatch(execRequestErrorAction(row));
            return false;
          }
        }

        if (command.params.length !== 0) {
          for (let i = 0; i < command.params.length; i++) {
            if (command.params[i].value == null) continue;
            const commandValue = command.params[i].value as string;
            if (commandValue.indexOf("{") !== -1) {
              const varStart = commandValue.indexOf("{") + 1;
              const varEnd = commandValue.indexOf("}");
              const varParam = commandValue.substring(varStart, varEnd);
              const varValue = getVariableValue(varParam);

              if (!varValue.isSuccess) {
                dispatch(execRequestErrorAction(row));
                return false;
              } else {
                paramsValue.push(varValue.value.toString());
              }

            } else {
              paramsValue.push(commandValue);
            }
          }
        }
        dispatch(postCommand(row, cmdType, req, paramsValue, commandret));
        exeret = commandret[0];
        break;

      case "control":
        const controlret = await executeControlRequest(row);
        exeret = controlret;
        break;

      default:
        break;
    }
    return exeret;
  }

  const executeControlRequest = async (row: number): Promise<boolean> => {
    const req = content[row].request;
    const method = req.method as string;
    const contollerBody = req.body as CommandController;
    let reqret = false;
    switch (method) {
      case "wait_sec":
        await _sleep(contollerBody.time * 1000);
        dispatch(execRequestSuccessAction(row));
        reqret = true;
        break;

      case "call":
        const fileName = contollerBody.fileName;
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
        let timer = 0;
        const timeoutsec = (contollerBody.timeoutsec === "" || isNaN(contollerBody.timeoutsec as number)) ? 10 : Number(contollerBody.timeoutsec);
        while (!reqret && timer < timeoutsec) {
          const latestTlmValue = getVariableValue(contollerBody.variable);
          if (!latestTlmValue.isSuccess) {
            dispatch(execRequestErrorAction(row));
            break;
          }

          if (compareValue(contollerBody.compare, latestTlmValue, contollerBody.value)) {
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
        const tlmValue = getVariableValue(contollerBody.variable);
        if (!tlmValue.isSuccess) {
          dispatch(execRequestErrorAction(row));
          break;
        }

        if (compareValue(contollerBody.compare, tlmValue, contollerBody.value)) {
          dispatch(execRequestSuccessAction(row));
          reqret = true;
        } else {
          dispatch(execRequestErrorAction(row));
          reqret = false;
        }
        break;

      case "let":
        let equ = contollerBody.equation;
        // const innerVar = tlms[tlmidx];
        // const val = parseTlmValue(innerVar.telemetryValue.value, innerVar.telemetryInfo.convType);
        reqret = true;
        while (equ.indexOf("{") !== -1) {
          const cmdFileVar = equ.substring(equ.indexOf("{") + 1, equ.indexOf("}"));
          const varValue = getVariableValue(cmdFileVar);
          if (!varValue.isSuccess) {
            dispatch(execRequestErrorAction(row));
            return false;
          }
          equ = equ.replace("{" + cmdFileVar + "}", varValue.value.toString());
        }
        let equAns = "";
        try {
          equAns = (eval(equ) as string | number).toString();
        }
        catch (e) {
          equAns = equ;
        }
        const cmdFileVariablesTemp = [...cmdFileVariables];
        const varIndex = cmdFileVariables.findIndex(index => index.variable === contollerBody.variable);
        if (varIndex >= 0) {
          cmdFileVariablesTemp[varIndex].value = equAns;
        } else {
          cmdFileVariablesTemp.push({ variable: contollerBody.variable, value: equAns });
        }
        setCmdFileVariables(cmdFileVariablesTemp);
        dispatch(execRequestSuccessAction(row));
        dispatch(editCmdFileVariableAction(cmdFileVariablesTemp));
        break;

      case "get":
        const reqValue = getVariableValue(contollerBody.variable);
        const newText = (req.stopFlag ? "." : " ") + `${method} ${contollerBody.variable} ${reqValue.value}`;
        await setCmdline(row, newText);
        if (!reqValue.isSuccess) {
          dispatch(execRequestErrorAction(row));
        } else {
          dispatch(execRequestSuccessAction(row));
        }
        reqret = true;
        break;

      default:
        break;
    }
    return reqret;
  };

  const parseTlmValue = (value: string, convType: string): number | string => {
    switch (convType) {
      case "NONE":
      case "POLY":
        return Number(value);
      case "STATUS":
      case "HEX":
      default:
        return value;
    }
  }

  const sendCmdFileLine = (row: number, ret: boolean) => {
    const status_tmp: RequestStatus = ret ? { success: true, error: false } : { success: false, error: true };
    const content_tmp: CommandPlanLine = { request: content[row].request, status: status_tmp };
    dispatch(postCommandFileLineLog(content_tmp));
  }

  return (
    <>
      <div style={{ height: 700, zIndex: (value === index) ? 99 : 1, position: "absolute", backgroundColor: "#212121" }}>
        <div
          role="tabpanel"
          id={`vertical-tabpanel-${index}`}
          aria-labelledby={`vertical-tab-${index}`}
        >
          <input
            type="text"
            style={{ backgroundColor: "red", position: "absolute", zIndex: -10, outline: 0 }}
            ref={textInput}
            onKeyDown={handleKeyDownWrapper}
            readOnly
          >
          </input>
          <TableContainer sx={{ width: 700, maxHeight: 700 }} id="plan-table-container">
            <Table stickyHeader onClick={handleTableClick}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "40px", padding: "0" }} />
                  <TableCell sx={{ width: "27px", padding: "0" }} />
                  <TableCell sx={{ fontWeight: "bold", }}>{name}</TableCell>
                  <TableCell sx={{ width: "120px", padding: "0" }} />
                </TableRow>
              </TableHead>
              <TableBody id="plan-table-body">
                {content.length > 0 && (
                  content.map((line, i) => (
                    <RequestTableRow
                      key={i} line={line} index={i} isSelected={i === selectedRow}
                      onClick={() => handleRowClick(i)}
                      onDoubleClick={() => { handleEditCmdline(i) }}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Dialog
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
                value={text} type="text" style={{ width: 940 }}
              />
            </DialogActions>
            <DialogActions>
              <Button
                variant="contained" color="primary" sx={{ width: 120 }}
                onClick={() => { setShowModal(false) }}
              >
                Cancel
              </Button>
              <Button
                variant="contained" color="primary" sx={{ width: 120 }}
                onClick={finishEditingWrapper}
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
