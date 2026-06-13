import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { MdDownload, MdPrint } from "react-icons/md";
import DataTable from "../components/DataTable.jsx";
import { exportToCsv, printReport } from "../utils/exporters.js";
import { getCenterName, sumBy } from "../utils/calculations.js";
import { getMonthKey, getWeekRange, isBetweenDates, toInputDate } from "../utils/dateUtils.js";
import { formatCurrency, formatDate, formatLiters, formatPercent } from "../utils/formatters.js";

const reportTypes = [
  { value: "daily", label: "Daily Report" },
  { value: "weekly", label: "Weekly Report" },
  { value: "monthly", label: "Monthly Report" },
  { value: "center", label: "Center-wise Report" },
];

export default function Reports() {
  const { centers, entries } = useOutletContext();
  const [reportType, setReportType] = useState("daily");
  const [date, setDate] = useState(toInputDate());
  const [weekDate, setWeekDate] = useState(toInputDate());
  const [month, setMonth] = useState(getMonthKey());
  const [centerId, setCenterId] = useState(centers[0]?.id || "all");

  const reportRows = useMemo(() => {
    if (reportType === "daily") {
      return entries.filter((entry) => entry.date === date);
    }

    if (reportType === "weekly") {
      const range = getWeekRange(weekDate);
      return entries.filter((entry) => isBetweenDates(entry.date, range.start, range.end));
    }

    if (reportType === "monthly") {
      return entries.filter((entry) => entry.date.startsWith(month));
    }

    return entries.filter((entry) => centerId === "all" || entry.centerId === centerId);
  }, [centerId, date, entries, month, reportType, weekDate]);

  const sortedRows = useMemo(
    () => [...reportRows].sort((first, second) => second.date.localeCompare(first.date)),
    [reportRows]
  );

  const reportTitle = reportTypes.find((item) => item.value === reportType)?.label || "Report";
  const totalLiters = sumBy(reportRows, (entry) => entry.totalLiters);
  const totalAmount = sumBy(reportRows, (entry) => entry.totalAmount);

  const columns = [
    {
      id: "date",
      label: "Date",
      render: (row) => formatDate(row.date),
    },
    {
      id: "center",
      label: "Collection Center",
      minWidth: 220,
      render: (row) => getCenterName(centers, row.centerId),
    },
    {
      id: "morningLiters",
      label: "Morning Liters",
      render: (row) => formatLiters(row.morning.liters),
    },
    {
      id: "eveningLiters",
      label: "Evening Liters",
      render: (row) => formatLiters(row.evening.liters),
    },
    {
      id: "quality",
      label: "Quality",
      minWidth: 150,
      render: (row) => (
        <Box>
          <Typography className="table-subtitle">Fat {formatPercent(row.morning.fat)}</Typography>
          <Typography className="table-subtitle">SNF {formatPercent(row.morning.snf)}</Typography>
        </Box>
      ),
    },
    {
      id: "totalLiters",
      label: "Total Liters",
      render: (row) => formatLiters(row.totalLiters),
    },
    {
      id: "totalAmount",
      label: "Total Amount",
      align: "right",
      render: (row) => formatCurrency(row.totalAmount),
    },
  ];

  const handleExport = () => {
    exportToCsv(
      `${reportTitle.toLowerCase().replaceAll(" ", "-")}.csv`,
      [
        { header: "Date", value: (row) => row.date },
        { header: "Collection Center", value: (row) => getCenterName(centers, row.centerId) },
        { header: "Morning Liters", value: (row) => row.morning.liters },
        { header: "Morning Fat", value: (row) => row.morning.fat },
        { header: "Morning SNF", value: (row) => row.morning.snf },
        { header: "Evening Liters", value: (row) => row.evening.liters },
        { header: "Evening Fat", value: (row) => row.evening.fat },
        { header: "Evening SNF", value: (row) => row.evening.snf },
        { header: "Total Liters", value: (row) => row.totalLiters },
        { header: "Total Amount", value: (row) => row.totalAmount },
      ],
      sortedRows
    );
  };

  return (
    <>
      <Box className="page-heading no-print">
        <Box>
          <Typography component="h1">Reports</Typography>
          <Typography>Generate daily, weekly, monthly, and center-wise milk collection reports.</Typography>
        </Box>
        <Stack direction="row" spacing={1} className="responsive-actions">
          <Button variant="outlined" startIcon={<MdDownload />} onClick={handleExport}>
            Export CSV
          </Button>
          <Button variant="contained" startIcon={<MdPrint />} onClick={printReport}>
            Print Report
          </Button>
        </Stack>
      </Box>

      <Paper className="soft-card report-filter no-print">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Report Type"
              value={reportType}
              onChange={(event) => setReportType(event.target.value)}
              fullWidth
            >
              {reportTypes.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {reportType === "daily" && (
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          )}

          {reportType === "weekly" && (
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Week Date"
                type="date"
                value={weekDate}
                onChange={(event) => setWeekDate(event.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          )}

          {reportType === "monthly" && (
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Month"
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          )}

          {reportType === "center" && (
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                label="Collection Center"
                value={centerId}
                onChange={(event) => setCenterId(event.target.value)}
                fullWidth
              >
                <MenuItem value="all">All Centers</MenuItem>
                {centers.map((center) => (
                  <MenuItem key={center.id} value={center.id}>
                    {center.centerName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Box className="print-area">
        <Box className="report-header">
          <Box>
            <Typography variant="h5">{reportTitle}</Typography>
            <Typography color="text.secondary">Sekar Milk Collection System</Typography>
          </Box>
          <Chip label={`${sortedRows.length} entries`} color="primary" variant="outlined" />
        </Box>

        <Box className="summary-grid" sx={{ mb: 2 }}>
          <Paper className="summary-tile">
            <Typography>Total Liters</Typography>
            <strong>{formatLiters(totalLiters)}</strong>
          </Paper>
          <Paper className="summary-tile">
            <Typography>Total Amount</Typography>
            <strong>{formatCurrency(totalAmount)}</strong>
          </Paper>
          <Paper className="summary-tile">
            <Typography>Average Liters</Typography>
            <strong>{formatLiters(sortedRows.length ? totalLiters / sortedRows.length : 0)}</strong>
          </Paper>
          <Paper className="summary-tile">
            <Typography>Centers Covered</Typography>
            <strong>{new Set(sortedRows.map((entry) => entry.centerId)).size}</strong>
          </Paper>
        </Box>

        <DataTable columns={columns} rows={sortedRows} emptyMessage="No report data for the selected filters." />
      </Box>
    </>
  );
}
