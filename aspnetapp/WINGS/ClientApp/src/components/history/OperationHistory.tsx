import React, { useEffect, useState, useCallback } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Pagination from '@material-ui/lab/Pagination';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import { Operation, PaginationMeta } from '../../models';
import ConfirmationDialog from '../common/ConfirmationDialog';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paginationRoot: {
      '& > *': {
        marginTop: theme.spacing(2),
      }
    },
    searchField: {
      "& input": {
        padding: 8
      }
    }
  })
);

const sizePerPage = 12;

const OperationHistory = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [meta, setMeta] = useState<PaginationMeta>();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [deleteOperation, setDeleteOperation] = useState<Operation | null>(null);

  const inputSearch = useCallback((event) => {
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
    dispatch(push(`/history/${operation.id}`, {data: operation}))
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
            label="" onChange={inputSearch} className={classes.searchField} style={{marginLeft: "auto"}}
            value={search} type="text" placeholder="Search" onKeyDown={(e) => {e.key === "Enter" && confirmSearch()}}
          />
          <IconButton style={{padding: "6px"}} onClick={confirmSearch}>
            <SearchIcon />
          </IconButton>
        </div>
        <div className="module-spacer--extra-extra-small"/>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Path Number</TableCell>
                <TableCell>Comment</TableCell>
                <TableCell>Component</TableCell>
                <TableCell className="t-row-icon-cell"/>
                <TableCell className="t-row-icon-cell"/>
              </TableRow>
            </TableHead>
            <TableBody>
              {operations.length > 0 && (
                operations.map(operation => (
                  <TableRow key={operation.id}>
                    <TableCell style={{width: "150px"}}>{operation.pathNumber}</TableCell>
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
