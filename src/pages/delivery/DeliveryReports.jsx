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
import { MdDownload, MdNightsStay, MdPrint, MdWbSunny } from "react-icons/md";
import DataTable from "../../components/DataTable.jsx";
import { exportToCsv, printReport } from "../../utils/exporters.js";
import { roundMoney, sumBy } from "../../utils/calculations.js";
import { getMonthKey, getWeekRange, isBetweenDates, toInputDate } from "../../utils/dateUtils.js";
import { formatDate, formatLiters } from "../../utils/formatters.js";

const reportTypes = [
  { value: "daily",    label: "Daily Report" },
  { value: "weekly",   label: "Weekly Report" },
  { value: "monthly",  label: "Monthly Report" },
  { value: "customer", label: "Customer-wise Report" },
];

export default function DeliveryReports() {
  const { deliveryCustomers, deliveryEntries } = useOutletContext();
  const [reportType, setReportType] = useState("daily");
  const [date, setDate]         = useState(toInputDate());
  const [weekDate, setWeekDate] = useState(toInputDate());
  const [month, setMonth]       = useState(getMonthKey());
  const [customerId, setCustomerId] = useState("all");

  const activeCustomers = useMemo(
    () => deliveryCustomers.filter((c) => c.isActive),
    [deliveryCustomers]
  );

  const filteredEntries = useMemo(() => {
    if (reportType === "daily")    return deliveryEntries.filter((e) => e.date === date);
    if (reportType === "weekly") {
      const range = getWeekRange(weekDate);
      return deliveryEntries.filter((e) => isBetweenDates(e.date, range.start, range.end));
    }
    if (reportType === "monthly")  return deliveryEntries.filter((e) => e.date.startsWith(month));
    return deliveryEntries.filter((e) => customerId === "all" || e.customerId === customerId);
  }, [reportType, date, weekDate, month, customerId, deliveryEntries]);

  // Build display rows by joining with customer info
  const rows = useMemo(() => {
    const sorted = [...filteredEntries].sort((a, b) => b.date.localeCompare(a.date));
    return sorted.map((entry) => {
      const customer = deliveryCustomers.find((c) => c.id === entry.customerId);
      return {
        ...entry,
        customerName: customer?.name || "Unknown",
        clientId: customer?.clientId || "—",
      };
    });
  }, [filteredEntries, deliveryCustomers]);

  const totalMorning = roundMoney(sumBy(rows, (r) => r.morning.litres));
  const totalEvening = roundMoney(sumBy(rows, (r) => r.evening.litres));
  const totalLitres  = roundMoney(totalMorning + totalEvening);
  const uniqueDays   = new Set(rows.map((r) => r.date)).size;
  const uniqueCustomers = new Set(rows.map((r) => r.customerId)).size;

  const reportTitle = reportTypes.find((t) => t.value === reportType)?.label || "Report";

  const columns = [
    { id: "date",         label: "Date",        render: (r) => formatDate(r.date) },
    {
      id: "clientId",
      label: "Client ID",
      minWidth: 90,
      render: (r) => (
        <Chip
          label={r.clientId}
          size="small"
          sx={{ fontWeight: 700, bgcolor: "#E8F5E9", color: "#2A8835", border: "1px solid #C5E0C7" }}
        />
      ),
    },
    { id: "customerName", label: "Customer",    minWidth: 180 },
    {
      id: "morning",
      label: "Morning",
      render: (r) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <MdWbSunny size={14} color="#b45309" />
          <Typography sx={{ fontSize: "0.88rem", fontWeight: 600 }}>
            {formatLiters(r.morning.litres)}
          </Typography>
        </Box>
      ),
    },
    {
      id: "evening",
      label: "Evening",
      render: (r) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <MdNightsStay size={14} color="#5b21b6" />
          <Typography sx={{ fontSize: "0.88rem", fontWeight: 600 }}>
            {formatLiters(r.evening.litres)}
          </Typography>
        </Box>
      ),
    },
    {
      id: "totalLitres",
      label: "Total",
      align: "right",
      render: (r) => (
        <Typography sx={{ fontWeight: 700, color: r.totalLitres > 0 ? "#2A8835" : "#9ca3af" }}>
          {formatLiters(r.totalLitres)}
        </Typography>
      ),
    },
  ];

  const handleExport = () => {
    exportToCsv(
      `delivery-${reportTitle.toLowerCase().replace(/ /g, "-")}.csv`,
      [
        { header: "Date",            value: (r) => r.date },
        { header: "Client ID",       value: (r) => r.clientId },
        { header: "Customer",        value: (r) => r.customerName },
        { header: "Morning Litres",  value: (r) => r.morning.litres },
        { header: "Evening Litres",  value: (r) => r.evening.litres },
        { header: "Total Litres",    value: (r) => r.totalLitres },
      ],
      rows
    );
  };

  return (
    <>
      <Box className="page-heading no-print">
        <Box>
          <Typography component="h1">Delivery Reports</Typography>
          <Typography>Daily, weekly, monthly, and customer-wise delivery summaries.</Typography>
        </Box>
        <Stack direction="row" spacing={1} className="responsive-actions">
          <Button variant="outlined" startIcon={<MdDownload />} onClick={handleExport}>
            Export CSV
          </Button>
          <Button variant="contained" startIcon={<MdPrint />} onClick={printReport}>
            Print
          </Button>
        </Stack>
      </Box>

      {/* Filters */}
      <Paper className="soft-card report-filter no-print">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              fullWidth
            >
              {reportTypes.map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {reportType === "daily" && (
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
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
                onChange={(e) => setWeekDate(e.target.value)}
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
                onChange={(e) => setMonth(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          )}
          {reportType === "customer" && (
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                label="Customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                fullWidth
              >
                <MenuItem value="all">All Customers</MenuItem>
                {activeCustomers.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.clientId} — {c.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {[
          { label: "Total Litres", value: formatLiters(totalLitres), color: "#2A8835", bg: "#E8F5E9" },
          {
            label: "Morning",
            value: formatLiters(totalMorning),
            color: "#b45309",
            bg: "#fff8e1",
            icon: <MdWbSunny size={16} />,
          },
          {
            label: "Evening",
            value: formatLiters(totalEvening),
            color: "#5b21b6",
            bg: "#ede9fe",
            icon: <MdNightsStay size={16} />,
          },
          {
            label: "Days Covered",
            value: uniqueDays,
            sub: `${uniqueCustomers} customers`,
            color: "#00C49A",
            bg: "#e6faf6",
          },
        ].map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.label}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: "12px",
                border: `1px solid ${card.bg}`,
                background: `linear-gradient(135deg, ${card.bg}, #ffffff)`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                {card.icon && <Box sx={{ color: card.color }}>{card.icon}</Box>}
                <Typography sx={{ color: "#607085", fontWeight: 600, fontSize: "0.82rem" }}>
                  {card.label}
                </Typography>
              </Stack>
              <Typography sx={{ color: card.color, fontWeight: 700, fontSize: "1.5rem" }}>
                {card.value}
              </Typography>
              {card.sub && (
                <Typography sx={{ color: "#9ca3af", fontSize: "0.78rem", mt: 0.5 }}>
                  {card.sub}
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Table */}
      <Box className="print-area">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Typography variant="h6">{reportTitle}</Typography>
          <Chip label={`${rows.length} records`} color="primary" variant="outlined" />
        </Stack>
        <DataTable
          columns={columns}
          rows={rows}
          emptyMessage="No delivery data for the selected filters."
        />
      </Box>
    </>
  );
}
