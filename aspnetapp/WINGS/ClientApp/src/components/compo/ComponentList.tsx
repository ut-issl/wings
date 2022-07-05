import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import AddIcon from '@material-ui/icons/Add';
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
  const [isEditModeArr, setIsEditModeArr ] = useState<boolean[]>([]);
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
    newArr.splice(i,1,!isEditModeArr[i]);
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
    setValues({ ...values, [name]: value});
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
      const message = `Status Code: ${res.status}\n${json.message ? json.message: "unknown error"}`;
      dispatch(openErrorDialogAction(message));
    }
  };

  const createComponent = async () => {
    const res = await fetch(`/api/components`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },      body: JSON.stringify({
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
      const message = `Status Code: ${res.status}\n${json.message ? json.message: "unknown error"}`;
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
        <h2 className="u-text__headline" style={{marginLeft: 0}}>Components List</h2>
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
                <TableCell className="t-row-icon-cell"/>
                <TableCell className="t-row-icon-cell"/>
              </TableRow>
            </TableHead>
            <TableBody>
              {compos.length > 0 && (
                compos.map((compo,i) => (
                  <TableRow key={compo.id}>
                    <EditableInputTableCell isEditMode={isEditModeArr[i]} name="name" value={values.name} label={compo.name} onChange={handleChange}/>
                    <EditableInputTableCell isEditMode={isEditModeArr[i]} name="localDirPath" value={values.localDirPath} label={compo.localDirPath} onChange={handleChange}/>
                    <EditableInputTableCell isEditMode={isEditModeArr[i]} name="tcPacketKey" value={values.tcPacketKey} label={compo.tcPacketKey} onChange={handleChange}/>
                    <EditableInputTableCell isEditMode={isEditModeArr[i]} name="tmPacketKey" value={values.tmPacketKey} label={compo.tmPacketKey} onChange={handleChange}/>
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
                  <EditableInputTableCell isEditMode={true} name="name" value={values.name} label="" onChange={handleChange}/>
                  <EditableInputTableCell isEditMode={true} name="localDirPath" value={values.localDirPath} label="" onChange={handleChange}/>
                  <EditableInputTableCell isEditMode={true} name="tcPacketKey" value={values.tcPacketKey} label="" onChange={handleChange}/>
                  <EditableInputTableCell isEditMode={true} name="tmPacketKey" value={values.tmPacketKey} label="" onChange={handleChange}/>
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
                  <TableCell className="t-row-icon-cell"/>
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
