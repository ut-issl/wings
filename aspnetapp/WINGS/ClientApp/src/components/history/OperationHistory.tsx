import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Pagination from '@mui/lab/Pagination';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { Operation, PaginationMeta } from '../../models';
import ConfirmationDialog from '../common/ConfirmationDialog';

const sizePerPage = 12;

const OperationHistory = () => {
  const [meta, setMeta] = useState<PaginationMeta>();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [deleteOperation, setDeleteOperation] = useState<Operation | null>(null);
  const navigate = useNavigate();

  const inputSearch = useCallback((event: any) => {
    setSearch(event.target.value)
  }, [setSearch]);

  const fetchOperations = async () => {
    const response = await fetch(`/api/operations/history?page=${page}&size=${sizePerPage}&search=${search}`, {
      method: 'GET'
    });
    if (response.status == 200) {
      const json = await response.json();
      const meta = json.meta as PaginationMeta;
      const data = json.data as Operation[];
      setMeta(meta);
      setOperations(data);
    }
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleDetailClick = (operation: Operation) => {
    navigate(`/history/${operation.id}`, { state: { data: operation } });
  }

  const confirmSearch = () => {
    setPage(1);
    fetchOperations();
  }

  const handelDeleteClick = (operation: Operation) => {
    setOpen(true);
    setDeleteOperation(operation);
  }

  const handleOkClick = async () => {
    await fetch(`/api/operations/${deleteOperation?.id}/history`, {
      method: 'DELETE'
    });
    fetchOperations();
  }

  const handleDialogClose = () => {
    setOpen(false);
    setDeleteOperation(null);
  }

  useEffect(() => {
    fetchOperations();
  }, [page]);

  return (
    <section className="c-section-container">
      <h2 className="u-text__headline">Operation History</h2>
      <div className="p-content-next-headline">
        <div className="p-grid__row">
          <div>
            <Pagination
              page={page}
              onChange={handlePageChange}
              count={meta?.pageCount}
              showFirstButton showLastButton
            />
          </div>
          <TextField
            label="" onChange={inputSearch} style={{ marginLeft: "auto", padding: 0 }}
            value={search} type="text" placeholder="Search" onKeyDown={(e) => { e.key === "Enter" && confirmSearch() }}
          />
          <IconButton style={{ padding: "6px" }} onClick={confirmSearch}>
            <SearchIcon />
          </IconButton>
        </div>
        <div className="module-spacer--extra-extra-small" />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Path Number</TableCell>
                <TableCell>Comment</TableCell>
                <TableCell>Component</TableCell>
                <TableCell className="t-row-icon-cell" />
                <TableCell className="t-row-icon-cell" />
              </TableRow>
            </TableHead>
            <TableBody>
              {operations.length > 0 && (
                operations.map(operation => (
                  <TableRow key={operation.id}>
                    <TableCell style={{ width: "150px" }}>{operation.pathNumber}</TableCell>
                    <TableCell>{operation.comment}</TableCell>
                    <TableCell>{operation.component && operation.component.name}</TableCell>
                    <TableCell>
                      <Tooltip title="Detail">
                        <IconButton className="t-row-icon-cell" onClick={() => handleDetailClick(operation)}>
                          <ChevronRightIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Delete">
                        <IconButton className="t-row-icon-cell" onClick={() => handelDeleteClick(operation)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <ConfirmationDialog
        open={open} onOkClick={async () => await handleOkClick()}
        labelOk="Delete" onClose={handleDialogClose}
      >
        <p>Are you sure to delete log of</p>
        <p>{deleteOperation?.pathNumber} : {deleteOperation?.comment}</p>
        <p>？</p>
      </ConfirmationDialog>
    </section>
  )
};

export default OperationHistory;
