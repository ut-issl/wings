import React, { useEffect, useState, useCallback } from 'react';
import { Button, TextField } from '@mui/material';
import SelectBox, { SelectOption } from '../common/SelectBox';
import RadioBox from '../common/RadioBox';
import { Component } from '../../models';
import { useDispatch } from 'react-redux';
import { openErrorDialogAction, startLoadingAction, endLoadingAction } from '../../redux/ui/actions';

const getDefaultPathNumber = () => {
  const dt = new Date();
  const YY = ('00' + dt.getFullYear()).slice(-2);
  const MM = ('00' + (dt.getMonth() + 1)).slice(-2);
  const DD = ('00' + dt.getDate()).slice(-2);
  const hh = ('00' + dt.getHours()).slice(-2);
  const mm = ('00' + dt.getMinutes()).slice(-2);
  return (YY + MM + DD + "-" + hh + mm);
}

const fileLocationOptions = [
  { id: "Local", name: "Local" }
]

const tmtcTargetOptions = [
  { id: "TmtcIf", name: "TmtcIf" }
]

export interface StartOperationAreaProps {
  updateState: () => void
}

const StartOperationArea = (props: StartOperationAreaProps) => {
  const dispatch = useDispatch();

  const [pathNumber, setPathNumber] = useState(getDefaultPathNumber()),
    [comment, setComment] = useState(""),
    [compoId, setCompoId] = useState(""),
    [compos, setCompos] = useState<Component[]>([]),
    [fileLocation, setFileLocation] = useState("Local"),
    [tmtcTarget, setTmtcTarget] = useState("TmtcIf")

  const inputPathNumber = useCallback((event: any) => {
    setPathNumber(event.target.value)
  }, [setPathNumber]);

  const inputComment = useCallback((event: any) => {
    setComment(event.target.value)
  }, [setComment]);

  const fetchComponents = async () => {
    const res = await fetch('/api/components', {
      method: 'GET'
    });
    if (res.status == 200) {
      const json = await res.json();
      const data = json.data as Component[];
      setCompos(data);
    }
  }

  const startOperation = async () => {
    dispatch(startLoadingAction());
    const res = await fetch(`/api/operations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operation: {
          pathNumber: pathNumber,
          comment: comment,
          fileLocation: fileLocation,
          tmtcTarget: tmtcTarget,
          componentId: compoId
        },
      }, ["operation", "pathNumber", "comment", "fileLocation", "tmtcTarget", "componentId"])
    });
    dispatch(endLoadingAction());
    if (res.status === 201) {
      setPathNumber(getDefaultPathNumber());
      setComment("");
      props.updateState();
    } else {
      const json = await res.json();
      const message = `Status Code: ${res.status}\n${json.message ? json.message : "unknown error"}`;
      dispatch(openErrorDialogAction(message));
    }
  }

  useEffect(() => {
    fetchComponents();
  }, []);

  return (
    <>
      <div className="p-content-next-headline">
        <form className={`p-grid__column`} style={{ maxWidth: 700 }}>
          <TextField
            label="Path Number" onChange={inputPathNumber}
            value={pathNumber} type="text"
          />
          <div className="module-spacer--extra-extra-small" />
          <TextField
            label="Comment" onChange={inputComment}
            value={comment} type="text"
          />
          <div className="module-spacer--extra-extra-small" />
          <SelectBox
            label="Component" options={compos}
            select={setCompoId} value={compoId}
          />
          <div className="module-spacer--extra-extra-small" />
          <RadioBox
            label="TmtcTarget" options={tmtcTargetOptions}
            handleChange={setTmtcTarget} value={tmtcTarget}
          />
          <div className="module-spacer--extra-extra-small" />
          <RadioBox
            label="Telemetry and Command File Location" options={fileLocationOptions}
            handleChange={setFileLocation} value={fileLocation}
          />
          {fileLocation === "Local" && (
            <p color="textPrimary">{compos.find(compo => compo.id === compoId)?.localDirPath}</p>
          )}
          <Button
            variant="contained" color="primary" sx={{ width: 120 }}
            onClick={() => startOperation()}
          >
            Start
          </Button>
        </form>
      </div>
    </>
  )
};

export default StartOperationArea;
