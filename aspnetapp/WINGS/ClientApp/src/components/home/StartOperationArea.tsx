import React, { useEffect, useState, useCallback } from 'react';
import { Button, TextField } from '@mui/material';
import SelectBox from '../common/SelectBox';
import RadioBox from '../common/RadioBox';
import { Component, ComponentJson } from '../../models';
import { useDispatch } from 'react-redux';
import { openErrorDialogAction, startLoadingAction, endLoadingAction } from '../../redux/ui/actions';

const getDefaultPathNumber = () => {
  const dt = new Date();
  const YY = ('00' + dt.getFullYear().toString()).slice(-2);
  const MM = ('00' + (dt.getMonth() + 1).toString()).slice(-2);
  const DD = ('00' + dt.getDate().toString()).slice(-2);
  const hh = ('00' + dt.getHours().toString()).slice(-2);
  const mm = ('00' + dt.getMinutes().toString()).slice(-2);
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

  const inputPathNumber = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPathNumber(event.target.value)
  }, [setPathNumber]);

  const inputComment = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value)
  }, [setComment]);

  const fetchComponents = async () => {
    try {
      const res = await fetch('/api/components', {
        method: 'GET'
      });
      if (res.status === 200) {
        const json = await res.json() as ComponentJson;
        const data = json.data;
        setCompos(data);
      } else {
        console.error(`Failed to fetch components: ${res.statusText}`);
      }
    } catch (error) {
      console.error('An error occurred while fetching components:', error);
    }
  };

  const fetchComponentsWrapper = () => {
    fetchComponents().catch((error) => {
      console.error('An unhandled error occurred:', error);
    });
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
      const json = await res.json() as { message: string };
      const message = `Status Code: ${res.status}\n${json.message ? json.message : "unknown error"}`;
      dispatch(openErrorDialogAction(message));
    }
  }

  const startOperationClick = () => {
    startOperation().catch(error => {
      console.error("Error failed to start operation:", error);
    })
  };

  useEffect(() => {
    fetchComponentsWrapper();
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
            onClick={() => startOperationClick()}
          >
            Start
          </Button>
        </form>
      </div>
    </>
  )
};

export default StartOperationArea;
