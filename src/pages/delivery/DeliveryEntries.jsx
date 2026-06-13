import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdRefresh, MdSave, MdWbSunny, MdNightsStay } from "react-icons/md";
import { toInputDate } from "../../utils/dateUtils.js";
import { createId, roundMoney, toNumber } from "../../utils/calculations.js";
import { formatDate, formatLiters } from "../../utils/formatters.js";

function buildFormState(date, entries, customers) {
  const dayEntries = entries.filter((e) => e.date === date);
  const state = {};
  customers.forEach((customer) => {
    const existing = dayEntries.find((e) => e.customerId === customer.id);
    state[customer.id] = {
      morning: existing != null ? String(existing.morning.litres) : String(customer.morningLitres),
      evening: existing != null ? String(existing.evening.litres) : String(customer.eveningLitres),
    };
  });
  return state;
}

export default function DeliveryEntries() {
  const { deliveryCustomers, deliveryEntries, setDeliveryEntries } = useOutletContext();
  const today = toInputDate();

  const activeCustomers = useMemo(
    () => deliveryCustomers.filter((c) => c.isActive),
    [deliveryCustomers]
  );

  const [selectedDate, setSelectedDate] = useState(today);
  const [formState, setFormState] = useState(() =>
    buildFormState(today, deliveryEntries, activeCustomers)
  );
  const [saved, setSaved] = useState(false);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setFormState(buildFormState(newDate, deliveryEntries, activeCustomers));
    setSaved(false);
  };

  const handleChange = (customerId, session) => (event) => {
    setSaved(false);
    setFormState((current) => ({
      ...current,
      [customerId]: { ...current[customerId], [session]: event.target.value },
    }));
  };

  const loadDefaults = () => {
    const state = {};
    activeCustomers.forEach((customer) => {
      state[customer.id] = {
        morning: String(customer.morningLitres),
        evening: String(customer.eveningLitres),
      };
    });
    setFormState(state);
    setSaved(false);
  };

  const handleSave = () => {
    setDeliveryEntries((current) => {
      const otherEntries = current.filter((e) => e.date !== selectedDate);
      const todayEntries = activeCustomers.map((customer) => {
        const form = formState[customer.id] || {};
        const morningLitres = roundMoney(toNumber(form.morning));
        const eveningLitres = roundMoney(toNumber(form.evening));
        const existing = current.find(
          (e) => e.date === selectedDate && e.customerId === customer.id
        );
        return {
          id: existing?.id || createId("dentry"),
          customerId: customer.id,
          date: selectedDate,
          morning: { litres: morningLitres, delivered: morningLitres > 0 },
          evening: { litres: eveningLitres, delivered: eveningLitres > 0 },
          totalLitres: roundMoney(morningLitres + eveningLitres),
          createdAt: existing?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
      return [...otherEntries, ...todayEntries];
    });
    setSaved(true);
  };

  const totals = useMemo(() => {
    let morning = 0;
    let evening = 0;
    activeCustomers.forEach((c) => {
      const form = formState[c.id] || {};
      morning += toNumber(form.morning);
      evening += toNumber(form.evening);
    });
    return {
      morning: roundMoney(morning),
      evening: roundMoney(evening),
      total: roundMoney(morning + evening),
    };
  }, [formState, activeCustomers]);

  const morningDelivered = activeCustomers.filter(
    (c) => toNumber((formState[c.id] || {}).morning) > 0
  ).length;
  const eveningDelivered = activeCustomers.filter(
    (c) => toNumber((formState[c.id] || {}).evening) > 0
  ).length;

  return (
    <>
      <Box className="page-heading">
        <Box>
          <Typography component="h1">Daily Delivery Log</Typography>
          <Typography>Record morning and evening milk delivered to each house.</Typography>
        </Box>
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Tooltip title="Reset all to customer default litres">
            <Button variant="outlined" startIcon={<MdRefresh />} onClick={loadDefaults}>
              Load Defaults
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<MdSave />}
            onClick={handleSave}
            color={saved ? "success" : "primary"}
          >
            {saved ? "Saved" : "Save All Entries"}
          </Button>
        </Stack>
      </Box>

      {/* Date + summary bar */}
      <Paper
        sx={{
          p: 2,
          mb: 2.5,
          border: "1px solid #e4edf7",
          borderRadius: "12px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
        }}
      >
        <TextField
          label="Delivery Date"
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          size="small"
          sx={{ width: 190 }}
          InputLabelProps={{ shrink: true }}
        />
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Chip
            icon={<MdWbSunny size={14} />}
            label={`Morning: ${morningDelivered}/${activeCustomers.length} houses Â· ${formatLiters(totals.morning)}`}
            sx={{
              bgcolor: "#fff8e1",
              color: "#b45309",
              fontWeight: 700,
              border: "1px solid #fde68a",
            }}
          />
          <Chip
            icon={<MdNightsStay size={14} />}
            label={`Evening: ${eveningDelivered}/${activeCustomers.length} houses Â· ${formatLiters(totals.evening)}`}
            sx={{
              bgcolor: "#ede9fe",
              color: "#5b21b6",
              fontWeight: 700,
              border: "1px solid #c4b5fd",
            }}
          />
          <Chip
            label={`Total: ${formatLiters(totals.total)}`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        </Stack>
      </Paper>

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
              <TableCell sx={{ width: 150 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <MdWbSunny size={15} color="#b45309" />
                  <span>Morning (L)</span>
                </Stack>
              </TableCell>
              <TableCell sx={{ width: 150 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <MdNightsStay size={15} color="#5b21b6" />
                  <span>Evening (L)</span>
                </Stack>
              </TableCell>
              <TableCell align="right" sx={{ width: 110 }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activeCustomers.map((customer, index) => {
              const form = formState[customer.id] || {};
              const morningVal = toNumber(form.morning);
              const eveningVal = toNumber(form.evening);
              const rowTotal = roundMoney(morningVal + eveningVal);

              return (
                <TableRow
                  key={customer.id}
                  sx={{
                    bgcolor: index % 2 === 0 ? "#ffffff" : "#fafcff",
                    "&:hover": { bgcolor: "#f4f9ff" },
                  }}
                >
                  <TableCell>
                    <Chip
                      label={customer.clientId}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.75rem",
                        bgcolor: "#E8F5E9",
                        color: "#2A8835",
                        border: "1px solid #C5E0C7",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography className="table-title">{customer.name}</Typography>
                    <Typography className="table-subtitle">{customer.address}</Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={form.morning ?? ""}
                      onChange={handleChange(customer.id, "morning")}
                      size="small"
                      inputProps={{ min: 0, step: "0.25" }}
                      sx={{
                        width: 120,
                        "& .MuiOutlinedInput-root": {
                          bgcolor: morningVal > 0 ? "#fffbeb" : "#fafafa",
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={form.evening ?? ""}
                      onChange={handleChange(customer.id, "evening")}
                      size="small"
                      inputProps={{ min: 0, step: "0.25" }}
                      sx={{
                        width: 120,
                        "& .MuiOutlinedInput-root": {
                          bgcolor: eveningVal > 0 ? "#f5f3ff" : "#fafafa",
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: rowTotal > 0 ? "#2A8835" : "#9ca3af",
                        fontSize: "0.9rem",
                      }}
                    >
                      {formatLiters(rowTotal)}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Footer totals row */}
            <TableRow sx={{ bgcolor: "#F0FAF1", borderTop: "2px solid #C8E6C9" }}>
              <TableCell colSpan={2}>
                <Typography sx={{ fontWeight: 800, color: "#162033", fontSize: "0.88rem" }}>
                  Day Total â€” {formatDate(selectedDate)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontWeight: 800, color: "#b45309" }}>
                  {formatLiters(totals.morning)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontWeight: 800, color: "#5b21b6" }}>
                  {formatLiters(totals.evening)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography sx={{ fontWeight: 800, color: "#2A8835" }}>
                  {formatLiters(totals.total)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
