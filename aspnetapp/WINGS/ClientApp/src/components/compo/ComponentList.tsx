import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import { Component } from '../../models';
import { openErrorDialogAction } from '../../redux/ui/actions';
import ConfirmationDialog from '../common/ConfirmationDialog';
import EditableInputTableCell from '../common/EditableInputTableCell';
import EditableSelectTableCell from '../common/EditableSelectTableCell';

const initialValues = {
  name: "",
  localDirPath: "",
  tcPacketKey: "",
  tmPacketKey: ""
};

export interface ComponentListProps {
  compos: Component[],
  updateState: () => void
}

const ComponentList = (props: ComponentListProps) => {
  const { compos, updateState } = props;
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [deleteCompo, setDeleteCompo] = useState<Component | null>(null);
  const [isEditModeArr, setIsEditModeArr] = useState<boolean[]>([]);
  const [isAddMode, setIsAddMode] = useState(false);
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    setIsEditModeArr(Array(compos.length).fill(false))
  }, [compos])

  const handleDeleteClick = (compo: Component) => {
    setOpen(true);
    setDeleteCompo(compo);
  }

  const handleOkClick = async () => {
    await fetch(`/api/components/${deleteCompo?.id}`, {
      method: 'DELETE'
    })
    updateState();
  }

  const handleDialogClose = () => {
    setOpen(false);
    setDeleteCompo(null);
  }

  const toggleEditMode = (i: number) => {
    const newArr = Array(compos.length).fill(false);
    newArr.splice(i, 1, !isEditModeArr[i]);
    setIsEditModeArr(newArr);
    setValues({
      name: compos[i].name,
      localDirPath: compos[i].localDirPath,
      tcPacketKey: compos[i].tcPacketKey,
      tmPacketKey: compos[i].tmPacketKey
    })
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
  };

  const updateComponent = async (i: number) => {
    const compo = compos[i];
    const res = await fetch(`/api/components/${compo.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: compo.id,
        name: values.name,
        localDirPath: values.localDirPath,
        tcPacketKey: values.tcPacketKey,
        tmPacketKey: values.tmPacketKey
      })
    });
    if (res.status === 200) {
      toggleEditMode(i);
      updateState();
    } else {
      const json = await res.json();
      const message = `Status Code: ${res.status}\n${json.message ? json.message : "unknown error"}`;
      dispatch(openErrorDialogAction(message));
    }
  };

  const createComponent = async () => {
    const res = await fetch(`/api/components`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }, body: JSON.stringify({
        name: values.name,
        localDirPath: values.localDirPath,
        tcPacketKey: values.tcPacketKey,
        tmPacketKey: values.tmPacketKey
      })
    });
    if (res.status === 201) {
      toggleAddMode();
      updateState();
    } else {
      const json = await res.json();
      const message = `Status Code: ${res.status}\n${json.message ? json.message : "unknown error"}`;
      dispatch(openErrorDialogAction(message));
    }
  }

  const toggleAddMode = () => {
    setIsAddMode(!isAddMode);
    setIsEditModeArr(Array(compos.length).fill(false));
    setValues(initialValues);
  };

  return (
    <>
      <div className="p-grid__row">
        <h2 className="u-text__headline" style={{ marginLeft: 0 }}>Components List</h2>
        <Tooltip title="Register">
          <IconButton onClick={toggleAddMode}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </div>
      <div className="p-content-next-headline">
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>LocalDirPath</TableCell>
                <TableCell>TcPacketKey</TableCell>
                <TableCell>TmPacketKey</TableCell>
                <TableCell className="t-row-icon-cell" />
                <TableCell className="t-row-icon-cell" />
              </TableRow>
            </TableHead>
            <TableBody>
              {compos.length > 0 && (
                compos.map((compo, i) => (
                  <TableRow key={compo.id}>
                    <EditableInputTableCell isEditMode={isEditModeArr[i]} name="name" value={values.name} label={compo.name} onChange={handleChange} />
                    <EditableInputTableCell isEditMode={isEditModeArr[i]} name="localDirPath" value={values.localDirPath} label={compo.localDirPath} onChange={handleChange} />
                    <EditableInputTableCell isEditMode={isEditModeArr[i]} name="tcPacketKey" value={values.tcPacketKey} label={compo.tcPacketKey} onChange={handleChange} />
                    <EditableInputTableCell isEditMode={isEditModeArr[i]} name="tmPacketKey" value={values.tmPacketKey} label={compo.tmPacketKey} onChange={handleChange} />
                    <TableCell>
                      {isEditModeArr[i] ? (
                        <>
                          <Tooltip title="Save">
                            <IconButton className="t-row-icon-cell" onClick={() => updateComponent(i)}>
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton className="t-row-icon-cell" onClick={() => toggleEditMode(i)}>
                              <ClearIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip title="Edit">
                          <IconButton className="t-row-icon-cell" onClick={() => toggleEditMode(i)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Delete">
                        <IconButton className="t-row-icon-cell" onClick={() => handleDeleteClick(compo)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {isAddMode && (
                <TableRow>
                  <EditableInputTableCell isEditMode={true} name="name" value={values.name} label="" onChange={handleChange} />
                  <EditableInputTableCell isEditMode={true} name="localDirPath" value={values.localDirPath} label="" onChange={handleChange} />
                  <EditableInputTableCell isEditMode={true} name="tcPacketKey" value={values.tcPacketKey} label="" onChange={handleChange} />
                  <EditableInputTableCell isEditMode={true} name="tmPacketKey" value={values.tmPacketKey} label="" onChange={handleChange} />
                  <TableCell>
                    <Tooltip title="Save">
                      <IconButton className="t-row-icon-cell" onClick={createComponent}>
                        <CheckIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancel">
                      <IconButton className="t-row-icon-cell" onClick={toggleAddMode}>
                        <ClearIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="t-row-icon-cell" />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <ConfirmationDialog
        open={open} onOkClick={async () => await handleOkClick()}
        labelOk="Delete" onClose={handleDialogClose}
      >
        <p>Are you sure to delete</p>
        <p>{deleteCompo?.name}</p>
        <p>?</p>
      </ConfirmationDialog>
    </>
  )
};

export default ComponentList;
