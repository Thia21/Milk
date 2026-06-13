import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { MdHistory, MdPaid, MdPayment } from "react-icons/md";
import DataTable from "../components/DataTable.jsx";
import { createId, getCenterName, normalizePayment, roundMoney, toNumber } from "../utils/calculations.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import { toInputDate } from "../utils/dateUtils.js";

function statusColor(status) {
  if (status === "Paid") {
    return "success";
  }

  if (status === "Partial") {
    return "warning";
  }

  return "error";
}

export default function Payments() {
  const { centers, payments, setPayments } = useOutletContext();
  const [partialPayment, setPartialPayment] = useState(null);
  const [historyPayment, setHistoryPayment] = useState(null);
  const [amount, setAmount] = useState("");

  const updatePayment = (paymentId, amountToAdd) => {
    const paymentDate = toInputDate();

    setPayments((current) =>
      current.map((payment) => {
        if (payment.id !== paymentId) {
          return payment;
        }

        const nextPaidAmount = roundMoney(toNumber(payment.paidAmount) + toNumber(amountToAdd));
        return normalizePayment({
          ...payment,
          paidAmount: nextPaidAmount,
          paymentDate,
          history: [
            ...(payment.history || []),
            {
              id: createId("history"),
              date: paymentDate,
              amount: roundMoney(amountToAdd),
              note: roundMoney(amountToAdd) >= payment.balanceAmount ? "Full settlement" : "Partial payment",
            },
          ],
        });
      })
    );
  };

  const handleMarkPaid = (payment) => {
    if (payment.balanceAmount <= 0) {
      return;
    }

    updatePayment(payment.id, payment.balanceAmount);
  };

  const openPartialDialog = (payment) => {
    setPartialPayment(payment);
    setAmount("");
  };

  const submitPartialPayment = (event) => {
    event.preventDefault();

    const paymentAmount = roundMoney(amount);
    if (!partialPayment || paymentAmount <= 0) {
      return;
    }

    updatePayment(partialPayment.id, Math.min(paymentAmount, partialPayment.balanceAmount));
    setPartialPayment(null);
  };

  const columns = [
    {
      id: "centerId",
      label: "Collection Center",
      minWidth: 230,
      render: (row) => getCenterName(centers, row.centerId),
    },
    {
      id: "totalAmount",
      label: "Total Amount",
      align: "right",
      render: (row) => formatCurrency(row.totalAmount),
    },
    {
      id: "paidAmount",
      label: "Paid Amount",
      align: "right",
      render: (row) => formatCurrency(row.paidAmount),
    },
    {
      id: "balanceAmount",
      label: "Balance",
      align: "right",
      render: (row) => formatCurrency(row.balanceAmount),
    },
    {
      id: "paymentDate",
      label: "Payment Date",
      render: (row) => formatDate(row.paymentDate),
    },
    {
      id: "status",
      label: "Status",
      render: (row) => <Chip size="small" color={statusColor(row.status)} label={row.status} />,
    },
    {
      id: "actions",
      label: "Actions",
      align: "right",
      minWidth: 190,
      render: (row) => (
        <span className="table-actions">
          <Tooltip title="Mark paid">
            <span>
              <IconButton
                aria-label="Mark payment paid"
                color="success"
                disabled={row.status === "Paid"}
                onClick={() => handleMarkPaid(row)}
              >
                <MdPaid size={20} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Partial payment">
            <span>
              <IconButton
                aria-label="Partial payment"
                color="primary"
                disabled={row.status === "Paid"}
                onClick={() => openPartialDialog(row)}
              >
                <MdPayment size={20} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Payment history">
            <IconButton aria-label="Payment history" onClick={() => setHistoryPayment(row)}>
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
          <Typography component="h1">Payments</Typography>
          <Typography>Manage paid, partial, and pending milk collection settlements.</Typography>
        </Box>
      </Box>

      <DataTable columns={columns} rows={payments} emptyMessage="No payment records available." />

      <Dialog open={Boolean(partialPayment)} onClose={() => setPartialPayment(null)} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={submitPartialPayment}>
          <DialogTitle>Partial Payment</DialogTitle>
          <DialogContent>
            {partialPayment && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Paper variant="outlined" className="payment-summary-tile">
                  <Typography>{getCenterName(centers, partialPayment.centerId)}</Typography>
                  <strong>{formatCurrency(partialPayment.balanceAmount)} balance</strong>
                </Paper>
                <TextField
                  label="Paid Amount"
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  inputProps={{ min: 1, max: partialPayment.balanceAmount, step: "0.01" }}
                  required
                  autoFocus
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPartialPayment(null)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save Payment
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(historyPayment)} onClose={() => setHistoryPayment(null)} fullWidth maxWidth="sm">
        <DialogTitle>Payment History</DialogTitle>
        <DialogContent>
          {historyPayment && (
            <>
              <Typography sx={{ mb: 2 }} color="text.secondary">
                {getCenterName(centers, historyPayment.centerId)}
              </Typography>
              <List className="history-list">
                {(historyPayment.history || []).length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No payment history available." />
                  </ListItem>
                ) : (
                  historyPayment.history.map((item) => (
                    <ListItem key={item.id} divider>
                      <ListItemText
                        primary={formatCurrency(item.amount)}
                        secondary={`${formatDate(item.date)} - ${item.note}`}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryPayment(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
