import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  MdCheckCircle,
  MdHistory,
  MdPayment,
  MdPaid,
} from "react-icons/md";
import DataTable from "../../components/DataTable.jsx";
import { createId, roundMoney, toNumber } from "../../utils/calculations.js";
import { formatCurrency, formatDate } from "../../utils/formatters.js";
import { toInputDate } from "../../utils/dateUtils.js";

function formatMonth(monthKey) {
  const [year, month] = monthKey.split("-");
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(
    new Date(Number(year), Number(month) - 1, 1)
  );
}

function statusColor(status) {
  if (status === "Paid") return "success";
  if (status === "Partial") return "warning";
  return "error";
}

function normalizeSubscription(sub) {
  const totalDue = roundMoney(sub.totalDue ?? 4000);
  const paidAmount = Math.min(roundMoney(sub.paidAmount ?? 0), totalDue);
  const balance = roundMoney(Math.max(totalDue - paidAmount, 0));
  let status = "Unpaid";
  if (paidAmount >= totalDue) status = "Paid";
  else if (paidAmount > 0) status = "Partial";
  return { ...sub, totalDue, paidAmount, balance, status };
}

export default function DeliverySubscriptions() {
  const { deliveryCustomers, deliverySubscriptions, setDeliverySubscriptions } = useOutletContext();
  const today = toInputDate();
  const currentMonth = today.slice(0, 7);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [partialSub, setPartialSub] = useState(null);
  const [historySub, setHistorySub] = useState(null);
  const [amount, setAmount] = useState("");

  const activeCustomers = useMemo(
    () => deliveryCustomers.filter((c) => c.isActive),
    [deliveryCustomers]
  );

  // Build a view row per customer (either from stored sub or computed as Unpaid)
  const subscriptionRows = useMemo(
    () =>
      activeCustomers.map((customer) => {
        const stored = deliverySubscriptions.find(
          (s) => s.customerId === customer.id && s.month === selectedMonth
        );
        if (stored) {
          return normalizeSubscription({ ...stored, customerName: customer.name, clientId: customer.clientId });
        }
        return {
          id: null,
          customerId: customer.id,
          customerName: customer.name,
          clientId: customer.clientId,
          month: selectedMonth,
          totalDue: customer.subscriptionAmount,
          paidAmount: 0,
          balance: customer.subscriptionAmount,
          status: "Unpaid",
          history: [],
        };
      }),
    [activeCustomers, deliverySubscriptions, selectedMonth]
  );

  const summary = useMemo(() => {
    const totalDue = subscriptionRows.reduce((a, r) => a + r.totalDue, 0);
    const totalCollected = subscriptionRows.reduce((a, r) => a + r.paidAmount, 0);
    const paid = subscriptionRows.filter((r) => r.status === "Paid").length;
    const partial = subscriptionRows.filter((r) => r.status === "Partial").length;
    const unpaid = subscriptionRows.filter((r) => r.status === "Unpaid").length;
    return { totalDue, totalCollected, balance: totalDue - totalCollected, paid, partial, unpaid };
  }, [subscriptionRows]);

  const upsertSubscription = (row, addedAmount) => {
    const paymentDate = toInputDate();
    const historyEntry = {
      id: createId("dsubh"),
      date: paymentDate,
      amount: roundMoney(addedAmount),
      note: roundMoney(addedAmount) >= row.balance ? "Full payment received" : "Partial payment received",
    };

    if (row.id) {
      // Update existing subscription
      setDeliverySubscriptions((current) =>
        current.map((s) => {
          if (s.id !== row.id) return s;
          const nextPaid = roundMoney(s.paidAmount + addedAmount);
          return normalizeSubscription({
            ...s,
            paidAmount: nextPaid,
            history: [...(s.history || []), historyEntry],
          });
        })
      );
    } else {
      // Create new subscription record
      const nextPaid = roundMoney(addedAmount);
      const newSub = normalizeSubscription({
        id: createId("dsub"),
        customerId: row.customerId,
        month: selectedMonth,
        totalDue: row.totalDue,
        paidAmount: nextPaid,
        history: [historyEntry],
      });
      setDeliverySubscriptions((current) => [...current, newSub]);
    }
  };

  const handleMarkPaid = (row) => {
    if (row.balance <= 0) return;
    upsertSubscription(row, row.balance);
  };

  const openPartial = (row) => {
    setPartialSub(row);
    setAmount("");
  };

  const submitPartial = (event) => {
    event.preventDefault();
    const paymentAmount = roundMoney(toNumber(amount));
    if (!partialSub || paymentAmount <= 0) return;
    upsertSubscription(partialSub, Math.min(paymentAmount, partialSub.balance));
    setPartialSub(null);
  };

  const columns = [
    {
      id: "house",
      label: "Client ID",
      minWidth: 90,
      render: (row) => (
        <Chip
          label={row.clientId}
          size="small"
          sx={{
            fontWeight: 800,
            fontSize: "0.75rem",
            bgcolor: "#E8F5E9",
            color: "#2A8835",
            border: "1px solid #C5E0C7",
          }}
        />
      ),
    },
    {
      id: "customerName",
      label: "Customer",
      minWidth: 200,
      render: (row) => <Typography className="table-title">{row.customerName}</Typography>,
    },
    {
      id: "totalDue",
      label: "Total Due",
      align: "right",
      render: (row) => formatCurrency(row.totalDue),
    },
    {
      id: "paidAmount",
      label: "Paid",
      align: "right",
      render: (row) => (
        <Typography sx={{ color: row.paidAmount > 0 ? "#1e8e3e" : "#9ca3af", fontWeight: 700 }}>
          {formatCurrency(row.paidAmount)}
        </Typography>
      ),
    },
    {
      id: "balance",
      label: "Balance",
      align: "right",
      render: (row) => (
        <Typography sx={{ color: row.balance > 0 ? "#d93025" : "#9ca3af", fontWeight: 700 }}>
          {formatCurrency(row.balance)}
        </Typography>
      ),
    },
    {
      id: "status",
      label: "Status",
      render: (row) => (
        <Chip
          label={row.status}
          color={statusColor(row.status)}
          size="small"
          variant={row.status === "Paid" ? "filled" : "outlined"}
        />
      ),
    },
    {
      id: "actions",
      label: "Actions",
      align: "right",
      minWidth: 160,
      render: (row) => (
        <span className="table-actions">
          <Tooltip title="Mark as fully paid">
            <span>
              <IconButton
                color="success"
                disabled={row.status === "Paid"}
                onClick={() => handleMarkPaid(row)}
              >
                <MdPaid size={20} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Record partial payment">
            <span>
              <IconButton
                color="primary"
                disabled={row.status === "Paid"}
                onClick={() => openPartial(row)}
              >
                <MdPayment size={20} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Payment history">
            <IconButton onClick={() => setHistorySub(row)}>
              <MdHistory size={20} />
            </IconButton>
          </Tooltip>
        </span>
      ),
    },
  ];

  return (
    <>
      <Box className="page-heading">
        <Box>
          <Typography component="h1">Subscription Payments</Typography>
          <Typography>
            Track monthly ₹4,000 subscriptions "” paid, partial, and outstanding.
          </Typography>
        </Box>
        <TextField
          label="Month"
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          size="small"
          sx={{ width: 200 }}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: "Total Revenue Target",
            value: formatCurrency(summary.totalDue),
            color: "#2A8835",
            bg: "#E8F5E9",
          },
          {
            label: "Amount Collected",
            value: formatCurrency(summary.totalCollected),
            color: "#1e8e3e",
            bg: "#e6f4ea",
          },
          {
            label: "Pending Balance",
            value: formatCurrency(summary.balance),
            color: "#d93025",
            bg: "#fce8e6",
          },
          {
            label: "Fully Paid",
            value: `${summary.paid} houses`,
            sub: `${summary.partial} partial · ${summary.unpaid} unpaid`,
            color: "#1e8e3e",
            bg: "#e6f4ea",
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
              <Typography
                sx={{ color: "#607085", fontWeight: 700, fontSize: "0.82rem", mb: 0.5 }}
              >
                {card.label}
              </Typography>
              <Typography sx={{ color: card.color, fontWeight: 800, fontSize: "1.5rem" }}>
                {card.value}
              </Typography>
              {card.sub && (
                <Typography sx={{ color: "#6b7a90", fontSize: "0.78rem", mt: 0.5 }}>
                  {card.sub}
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="h6">{formatMonth(selectedMonth)} "” All Customers</Typography>
        <Stack direction="row" spacing={1}>
          <Chip icon={<MdCheckCircle size={14} />} label={`${summary.paid} paid`} color="success" size="small" variant="outlined" />
          <Chip label={`${summary.partial} partial`} color="warning" size="small" variant="outlined" />
          <Chip label={`${summary.unpaid} unpaid`} color="error" size="small" variant="outlined" />
        </Stack>
      </Stack>

      <DataTable columns={columns} rows={subscriptionRows} emptyMessage="No customers found." />

      {/* Partial payment dialog */}
      <Dialog open={Boolean(partialSub)} onClose={() => setPartialSub(null)} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={submitPartial}>
          <DialogTitle>Partial Payment</DialogTitle>
          <DialogContent>
            {partialSub && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Paper
                  variant="outlined"
                  className="payment-summary-tile"
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Box>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#607085" }}>
                      {partialSub.clientId} "” {partialSub.customerName}
                    </Typography>
                    <strong>{formatCurrency(partialSub.balance)} outstanding</strong>
                  </Box>
                </Paper>
                <TextField
                  label="Amount Received (₹)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputProps={{ min: 1, max: partialSub.balance, step: "1" }}
                  required
                  autoFocus
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPartialSub(null)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Record Payment
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* History dialog */}
      <Dialog open={Boolean(historySub)} onClose={() => setHistorySub(null)} fullWidth maxWidth="sm">
        <DialogTitle>Payment History</DialogTitle>
        <DialogContent>
          {historySub && (
            <>
              <Typography sx={{ mb: 2, color: "#607085", fontWeight: 700 }}>
                {historySub.clientId} "” {historySub.customerName} · {formatMonth(selectedMonth)}
              </Typography>
              <List className="history-list">
                {(historySub.history || []).length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No payment history yet." secondary="No payments have been recorded for this month." />
                  </ListItem>
                ) : (
                  historySub.history.map((item) => (
                    <ListItem key={item.id} divider>
                      <ListItemText
                        primary={
                          <strong style={{ color: "#1e8e3e" }}>{formatCurrency(item.amount)}</strong>
                        }
                        secondary={`${formatDate(item.date)} "” ${item.note}`}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistorySub(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
