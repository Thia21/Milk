import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  MdHome,
  MdNightsStay,
  MdPeopleAlt,
  MdReceiptLong,
  MdWbSunny,
} from "react-icons/md";
import DashboardCards from "../../components/DashboardCards.jsx";
import { roundMoney, sumBy, toNumber } from "../../utils/calculations.js";
import { formatCurrency, formatDate, formatLiters } from "../../utils/formatters.js";
import { toInputDate } from "../../utils/dateUtils.js";

function formatMonth(monthKey) {
  const [year, month] = monthKey.split("-");
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(
    new Date(Number(year), Number(month) - 1, 1)
  );
}

export default function DeliveryDashboard() {
  const { deliveryCustomers, deliveryEntries, deliverySubscriptions } = useOutletContext();
  const today = toInputDate();
  const currentMonth = today.slice(0, 7);

  const activeCustomers = useMemo(
    () => deliveryCustomers.filter((c) => c.isActive),
    [deliveryCustomers]
  );

  const todayEntries = useMemo(
    () => deliveryEntries.filter((e) => e.date === today),
    [deliveryEntries, today]
  );

  const currentMonthSubs = useMemo(
    () => deliverySubscriptions.filter((s) => s.month === currentMonth),
    [deliverySubscriptions, currentMonth]
  );

  const totalExpected = sumBy(activeCustomers, (c) => c.subscriptionAmount);
  const totalCollected = sumBy(currentMonthSubs, (s) => s.paidAmount);
  const paidCount = currentMonthSubs.filter((s) => s.status === "Paid").length;
  const partialCount = currentMonthSubs.filter((s) => s.status === "Partial").length;
  const unpaidCount = activeCustomers.length - paidCount - partialCount;

  const morningDelivered = todayEntries.filter((e) => e.morning.delivered).length;
  const eveningDelivered = todayEntries.filter((e) => e.evening.delivered).length;
  const todayTotalLitres = sumBy(todayEntries, (e) => e.totalLitres);

  const cards = [
    {
      title: "Active Customers",
      value: activeCustomers.length,
      caption: `${deliveryCustomers.length} total registered`,
      icon: MdPeopleAlt,
      color: "#2A8835",
    },
    {
      title: "Morning Deliveries Today",
      value: `${morningDelivered} / ${activeCustomers.length}`,
      caption: `${formatLiters(sumBy(todayEntries, (e) => e.morning.litres))} delivered`,
      icon: MdWbSunny,
      color: "#f9ab00",
    },
    {
      title: "Evening Deliveries Today",
      value: `${eveningDelivered} / ${activeCustomers.length}`,
      caption: `${formatLiters(sumBy(todayEntries, (e) => e.evening.litres))} delivered`,
      icon: MdNightsStay,
      color: "#5b21b6",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(totalCollected),
      caption: `of ${formatCurrency(totalExpected)} target`,
      icon: MdReceiptLong,
      color: "#1e8e3e",
    },
    {
      title: "Today Total",
      value: formatLiters(todayTotalLitres),
      caption: `across ${todayEntries.length} houses`,
      icon: MdHome,
      color: "#00C49A",
    },
  ];

  // Build today's status for every active customer
  const todayStatus = useMemo(() =>
    activeCustomers.map((customer) => {
      const entry = todayEntries.find((e) => e.customerId === customer.id);
      return {
        customer,
        morning: entry?.morning.litres ?? 0,
        evening: entry?.evening.litres ?? 0,
        total: entry?.totalLitres ?? 0,
        hasEntry: Boolean(entry),
      };
    }),
    [activeCustomers, todayEntries]
  );

  const collectionProgress = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

  return (
    <>
      <Box className="page-heading">
        <Box>
          <Typography component="h1">Delivery Overview</Typography>
          <Typography>
            Live snapshot of today's deliveries and this month's subscription collection.
          </Typography>
        </Box>
        <Chip label={formatDate(today)} color="primary" variant="outlined" />
      </Box>

      <DashboardCards cards={cards} />

      <Grid container spacing={2.5}>
        {/* Today's delivery table */}
        <Grid item xs={12} lg={8}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="h6">Today's Delivery Status</Typography>
            <Stack direction="row" spacing={1}>
              <Chip
                icon={<MdWbSunny size={13} />}
                label={`${morningDelivered} morning`}
                sx={{ bgcolor: "#fff8e1", color: "#b45309", fontWeight: 700, border: "1px solid #fde68a", fontSize: "0.78rem" }}
              />
              <Chip
                icon={<MdNightsStay size={13} />}
                label={`${eveningDelivered} evening`}
                sx={{ bgcolor: "#ede9fe", color: "#5b21b6", fontWeight: 700, border: "1px solid #c4b5fd", fontSize: "0.78rem" }}
              />
            </Stack>
          </Stack>
          <TableContainer
            component={Paper}
            className="data-table-card"
            sx={{ borderRadius: "12px", border: "1px solid #e4edf7" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 80 }}>House</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell align="center">Morning</TableCell>
                  <TableCell align="center">Evening</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {todayStatus.map(({ customer, morning, evening, total, hasEntry }, index) => (
                  <TableRow
                    key={customer.id}
                    sx={{
                      bgcolor: index % 2 === 0 ? "#ffffff" : "#fafcff",
                      "&:hover": { bgcolor: "#f4f9ff" },
                      opacity: hasEntry ? 1 : 0.55,
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={customer.clientId}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.72rem",
                          bgcolor: "#E8F5E9",
                          color: "#2A8835",
                          border: "1px solid #C5E0C7",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography className="table-title">{customer.name}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      {morning > 0 ? (
                        <Chip
                          label={formatLiters(morning)}
                          size="small"
                          sx={{ bgcolor: "#fff8e1", color: "#b45309", fontWeight: 600, border: "1px solid #fde68a" }}
                        />
                      ) : (
                        <Typography sx={{ color: "#CBD5E1", fontSize: "0.82rem" }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {evening > 0 ? (
                        <Chip
                          label={formatLiters(evening)}
                          size="small"
                          sx={{ bgcolor: "#ede9fe", color: "#5b21b6", fontWeight: 600, border: "1px solid #c4b5fd" }}
                        />
                      ) : (
                        <Typography sx={{ color: "#CBD5E1", fontSize: "0.82rem" }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 700, color: total > 0 ? "#1A2B5E" : "#CBD5E1", fontSize: "0.88rem" }}>
                        {total > 0 ? formatLiters(total) : "—"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Subscription collection panel */}
        <Grid item xs={12} lg={4}>
          <Paper className="soft-card performance-panel" sx={{ borderRadius: "12px" }}>
            <Typography variant="h6">Subscription Collection</Typography>
            <Typography sx={{ color: "#607085", fontSize: "0.82rem", mt: 0.25, mb: 2.5 }}>
              {formatMonth(currentMonth)}
            </Typography>

            <Box sx={{ mb: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: "#6b7a90" }}>
                  Collection Progress
                </Typography>
                <Typography sx={{ fontWeight: 800, fontSize: "0.82rem", color: "#2A8835" }}>
                  {Math.round(collectionProgress)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(collectionProgress, 100)}
                className="performance-bar"
              />
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.75 }}>
                <Typography sx={{ fontSize: "0.78rem", color: "#9ca3af" }}>
                  {formatCurrency(totalCollected)} collected
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#9ca3af" }}>
                  {formatCurrency(totalExpected)} target
                </Typography>
              </Stack>
            </Box>

            {/* Status breakdown */}
            <Stack spacing={1.5}>
              {[
                { label: "Fully Paid", count: paidCount, color: "#1e8e3e", bg: "#e6f4ea", border: "#a8d5b5" },
                { label: "Partially Paid", count: partialCount, color: "#b45309", bg: "#fff8e1", border: "#fde68a" },
                { label: "Not Paid", count: unpaidCount, color: "#d93025", bg: "#fce8e6", border: "#f5c6c2" },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 1.25,
                    borderRadius: "8px",
                    bgcolor: item.bg,
                    border: `1px solid ${item.border}`,
                  }}
                >
                  <Typography sx={{ fontWeight: 700, color: "#374151", fontSize: "0.86rem" }}>
                    {item.label}
                  </Typography>
                  <Chip
                    label={`${item.count} houses`}
                    size="small"
                    sx={{ fontWeight: 800, color: item.color, bgcolor: "transparent", border: `1px solid ${item.color}` }}
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
