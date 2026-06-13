import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Box, Chip, Grid, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import {
  MdAccountBalanceWallet,
  MdDoneAll,
  MdLocalDrink,
  MdPendingActions,
  MdStorefront,
} from "react-icons/md";
import DashboardCards from "../components/DashboardCards.jsx";
import DataTable from "../components/DataTable.jsx";
import { compareDateDesc, getMonthKey, toInputDate } from "../utils/dateUtils.js";
import { formatCurrency, formatDate, formatLiters } from "../utils/formatters.js";
import { getCenterName, sumBy } from "../utils/calculations.js";

export default function Dashboard() {
  const { centers, entries, payments } = useOutletContext();

  const today = toInputDate();
  const monthKey = getMonthKey(today);

  const todayEntries = useMemo(
    () => entries.filter((entry) => entry.date === today),
    [entries, today]
  );

  const monthlyEntries = useMemo(
    () => entries.filter((entry) => entry.date.startsWith(monthKey)),
    [entries, monthKey]
  );

  const activeCenters = centers.filter((center) => center.status === "Active").length;
  const pendingAmount = sumBy(payments, (payment) => payment.balanceAmount);
  const paidAmount = sumBy(payments, (payment) => payment.paidAmount);

  const cards = [
    {
      title: "Total Collection Centers",
      value: centers.length,
      caption: `${activeCenters} active centers`,
      icon: MdStorefront,
      color: "#3DB54A",
    },
    {
      title: "Today's Milk Collection",
      value: formatLiters(sumBy(todayEntries, (entry) => entry.totalLiters)),
      caption: `${todayEntries.length} entries today`,
      icon: MdLocalDrink,
      color: "#00C49A",
    },
    {
      title: "Monthly Milk Collection",
      value: formatLiters(sumBy(monthlyEntries, (entry) => entry.totalLiters)),
      caption: `${monthlyEntries.length} total entries`,
      icon: MdDoneAll,
      color: "#1e8e3e",
    },
    {
      title: "Pending Payments",
      value: formatCurrency(pendingAmount),
      caption: "Balance to settle",
      icon: MdPendingActions,
      color: "#f9ab00",
    },
    {
      title: "Paid Payments",
      value: formatCurrency(paidAmount),
      caption: "Collected amount",
      icon: MdAccountBalanceWallet,
      color: "#2A8835",
    },
  ];

  const centerTotals = useMemo(
    () =>
      centers
        .map((center) => {
          const centerEntries = monthlyEntries.filter((entry) => entry.centerId === center.id);
          return {
            ...center,
            liters: sumBy(centerEntries, (entry) => entry.totalLiters),
          };
        })
        .sort((first, second) => second.liters - first.liters)
        .slice(0, 5),
    [centers, monthlyEntries]
  );

  const maxLiters = Math.max(...centerTotals.map((center) => center.liters), 1);

  const recentRows = useMemo(
    () => [...entries].sort(compareDateDesc).slice(0, 8),
    [entries]
  );

  const columns = [
    {
      id: "date",
      label: "Date",
      render: (row) => formatDate(row.date),
    },
    {
      id: "center",
      label: "Collection Center",
      render: (row) => getCenterName(centers, row.centerId),
      minWidth: 210,
    },
    {
      id: "morning",
      label: "Morning",
      render: (row) => formatLiters(row.morning.liters),
    },
    {
      id: "evening",
      label: "Evening",
      render: (row) => formatLiters(row.evening.liters),
    },
    {
      id: "totalLiters",
      label: "Total Liters",
      render: (row) => formatLiters(row.totalLiters),
    },
    {
      id: "totalAmount",
      label: "Amount",
      align: "right",
      render: (row) => formatCurrency(row.totalAmount),
    },
  ];

  return (
    <>
      <Box className="page-heading">
        <Box>
          <Typography component="h1">Sekar Milk Collection System</Typography>
          <Typography>
            Track milk collection, center performance, and settlement health from one clean workspace.
          </Typography>
        </Box>
      </Box>

      <DashboardCards cards={cards} />

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="h6">Recent Collection</Typography>
            <Chip label={formatDate(today)} color="primary" variant="outlined" />
          </Stack>
          <DataTable columns={columns} rows={recentRows} initialRowsPerPage={5} />
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper className="soft-card performance-panel">
            <Typography variant="h6">Monthly Center Performance</Typography>
            <Stack spacing={2.2} sx={{ mt: 2.5 }}>
              {centerTotals.map((center) => (
                <Box key={center.id}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Typography className="performance-name" noWrap>
                      {center.centerName}
                    </Typography>
                    <Typography className="performance-value">{formatLiters(center.liters)}</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(center.liters / maxLiters) * 100}
                    className="performance-bar"
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
