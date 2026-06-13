import { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";

export default function DataTable({
  columns,
  rows,
  getRowId,
  emptyMessage = "No records found",
  initialRowsPerPage = 10,
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [page, rows, rowsPerPage]);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  return (
    <Paper
      className="soft-card data-table-card"
      sx={{ borderRadius: "12px", overflow: "hidden" }}
    >
      <TableContainer>
        <Table size="medium">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || "left"}
                  sx={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Box className="empty-state">
                    <Typography>{emptyMessage}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, index) => (
                <TableRow
                  key={getRowId ? getRowId(row) : row.id || index}
                  sx={{
                    bgcolor: index % 2 === 0 ? "#ffffff" : "#F8FFF8",
                    "&:hover": { bgcolor: "#EDF8EE !important" },
                    transition: "background 120ms ease",
                  }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align || "left"}>
                      {column.render ? column.render(row) : row[column.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
          {rows.length > initialRowsPerPage && (
            <TableFooter>
              <TableRow>
                <TablePagination
                  count={rows.length}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[5, 10, 25]}
                  onPageChange={(_, nextPage) => setPage(nextPage)}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  colSpan={columns.length}
                />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>
    </Paper>
  );
}
