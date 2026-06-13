import { useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CssBaseline,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  MdCheckCircle,
  MdEdit,
  MdInfo,
  MdLocalShipping,
  MdNightsStay,
  MdSave,
  MdWbSunny,
} from "react-icons/md";
import { useLocalStorage } from "./hooks/useLocalStorage.js";
import { initialDeliveryCustomers, initialDeliveryEntries } from "./services/deliverySeedData.js";
import { createId, roundMoney, toNumber } from "./utils/calculations.js";
import { toInputDate } from "./utils/dateUtils.js";
import { formatDate, formatLiters } from "./utils/formatters.js";
import { getActiveSession, getISTTimeString, SESSION_WINDOW } from "./utils/timeUtils.js";
import AppNav from "./components/AppNav.jsx";
import { theme } from "./theme.js";
import "./index.css";

const S = {
  morning: { key: "morning", label: "Morning", Icon: MdWbSunny,    accent: "#b45309", bg: "#fffdf4", border: "#fde68a", chipBg: "#fff8e1" },
  evening: { key: "evening", label: "Evening", Icon: MdNightsStay, accent: "#5b21b6", bg: "#faf9ff", border: "#c4b5fd", chipBg: "#ede9fe" },
};

function loadFormFromEntry(customer, entries, date) {
  const existing = entries.find((e) => e.date === date && e.customerId === customer?.id);
  return {
    morning: String(existing?.morning.litres ?? customer.morningLitres),
    evening: String(existing?.evening.litres ?? customer.eveningLitres),
    existingId: existing?.id ?? null,
    existingMorning: existing?.morning.litres ?? null,
    existingEvening: existing?.evening.litres ?? null,
    createdAt: existing?.createdAt ?? null,
  };
}

export default function DeliveryEntryApp() {
  const [deliveryCustomers] = useLocalStorage("sekar-delivery-customers", initialDeliveryCustomers);
  const [deliveryEntries, setDeliveryEntries] = useLocalStorage("sekar-delivery-entries", initialDeliveryEntries);

  const activeCustomers = useMemo(() => deliveryCustomers.filter((c) => c.isActive), [deliveryCustomers]);

  const today = toInputDate();
  const activeSession = getActiveSession();
  const istTime = getISTTimeString();

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [form, setForm] = useState({ morning: "", evening: "" });
  // per-session saved state: null | { litres, offSession }
  const [sessionSaved, setSessionSaved] = useState({ morning: null, evening: null });
  // per-session editing mode
  const [editing, setEditing] = useState({ morning: true, evening: true });

  const resetForCustomer = (customer, date, entries) => {
    if (!customer) {
      setForm({ morning: "", evening: "" });
      setSessionSaved({ morning: null, evening: null });
      setEditing({ morning: true, evening: true });
      return;
    }
    const f = loadFormFromEntry(customer, entries, date);
    setForm({ morning: f.morning, evening: f.evening });
    // If session already has saved data, start in "saved" (non-editing) mode
    setSessionSaved({
      morning: f.existingMorning != null ? { litres: f.existingMorning } : null,
      evening: f.existingEvening != null ? { litres: f.existingEvening } : null,
    });
    setEditing({
      morning: f.existingMorning == null,
      evening: f.existingEvening == null,
    });
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (selectedCustomer) resetForCustomer(selectedCustomer, newDate, deliveryEntries);
  };

  const handleCustomerChange = (_, customer) => {
    setSelectedCustomer(customer);
    resetForCustomer(customer, selectedDate, deliveryEntries);
  };

  const handleSaveSession = (sk) => {
    if (!selectedCustomer) return;
    const val = roundMoney(toNumber(form[sk]));
    const isOffSession = sk !== activeSession;

    const otherKey = sk === "morning" ? "evening" : "morning";
    const existing = deliveryEntries.find(
      (e) => e.date === selectedDate && e.customerId === selectedCustomer.id
    );
    const otherLitres = existing?.[otherKey].litres ?? roundMoney(toNumber(form[otherKey]));

    const morningLitres = sk === "morning" ? val : otherLitres;
    const eveningLitres = sk === "evening" ? val : otherLitres;

    const newEntry = {
      id:          existing?.id || createId("dentry"),
      customerId:  selectedCustomer.id,
      date:        selectedDate,
      morning:     { litres: morningLitres, delivered: morningLitres > 0 },
      evening:     { litres: eveningLitres, delivered: eveningLitres > 0 },
      totalLitres: roundMoney(morningLitres + eveningLitres),
      createdAt:   existing?.createdAt || new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    };

    setDeliveryEntries((cur) =>
      existing ? cur.map((e) => (e.id === existing.id ? newEntry : e)) : [newEntry, ...cur]
    );
    setSessionSaved((prev) => ({ ...prev, [sk]: { litres: val, offSession: isOffSession } }));
    setEditing((prev) => ({ ...prev, [sk]: false }));
  };

  const handleEdit = (sk) => {
    setEditing((prev) => ({ ...prev, [sk]: true }));
    setSessionSaved((prev) => ({ ...prev, [sk]: null }));
  };

  const existingEntry = selectedCustomer
    ? deliveryEntries.find((e) => e.date === selectedDate && e.customerId === selectedCustomer.id)
    : null;

  const savedMorning = sessionSaved.morning?.litres ?? 0;
  const savedEvening = sessionSaved.evening?.litres ?? 0;
  const totalSaved = roundMoney(savedMorning + savedEvening);

  const todayEntries = useMemo(
    () =>
      [...deliveryEntries.filter((e) => e.date === selectedDate)].sort((a, b) => {
        const ca = deliveryCustomers.find((c) => c.id === a.customerId);
        const cb = deliveryCustomers.find((c) => c.id === b.customerId);
        return (ca?.clientId || "").localeCompare(cb?.clientId || "");
      }),
    [deliveryEntries, selectedDate, deliveryCustomers]
  );

  const activeCfg = S[activeSession];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppNav current="delivery" />

      <Box sx={{ maxWidth: 820, mx: "auto", px: { xs: 2, sm: 3 }, pt: { xs: 9, sm: 10 }, pb: 6 }}>

        {/* Header */}
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between"
          sx={{ mb: 3, gap: 1.5, animation: "fadeSlideUp 0.38s cubic-bezier(0.22,1,0.36,1) both" }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 44, height: 44, borderRadius: "12px", background: "linear-gradient(135deg,#5b21b6,#7c3aed)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <MdLocalShipping size={22} color="#fff" />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#1A2B5E", lineHeight: 1.15 }}>Delivery Entry</Typography>
              <Typography sx={{ color: "#6B7A99", fontSize: "0.85rem" }}>Save morning &amp; evening per customer</Typography>
            </Box>
          </Stack>
          <Paper sx={{ px: 2, py: 1, border: `1.5px solid ${activeCfg.border}`, bgcolor: activeCfg.bg, borderRadius: "12px", flexShrink: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <activeCfg.Icon size={15} color={activeCfg.accent} />
              <Box>
                <Typography sx={{ fontSize: "0.68rem", color: activeCfg.accent, fontWeight: 700, lineHeight: 1 }}>CURRENT (IST)</Typography>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: activeCfg.accent }}>{activeCfg.label} · {istTime}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>

        {/* Date + Customer search */}
        <Paper sx={{ p: { xs: 2, sm: 2.5 }, mb: 2.5, border: "1px solid #E2E8F7", borderRadius: "16px", animation: "fadeSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) 0.08s both" }}>
          <Stack spacing={2}>
            <TextField label="Delivery Date" type="date" value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
            <Autocomplete
              options={activeCustomers}
              getOptionLabel={(c) => `${c.clientId} — ${c.name}`}
              filterOptions={(opts, { inputValue }) => {
                const q = inputValue.toLowerCase();
                return opts.filter((o) =>
                  o.name.toLowerCase().includes(q) ||
                  o.clientId.toLowerCase().includes(q) ||
                  (o.address || "").toLowerCase().includes(q) ||
                  o.phone.includes(q)
                );
              }}
              renderOption={(props, option) => {
                const { key, ...liProps } = props;
                return (
                  <Box
                    key={key}
                    component="li"
                    {...liProps}
                    sx={{ px: 2, py: 1.25, borderBottom: "1px solid #F0F4FF", "&:last-child": { borderBottom: 0 }, "&.Mui-focused": { bgcolor: "#EEF2FF" } }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Chip label={option.clientId} size="small"
                        sx={{ fontWeight: 700, fontSize: "0.72rem", bgcolor: "#EEF2FF", color: "#2D46C4", border: "1px solid #BFD0F7", flexShrink: 0, minWidth: 58 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.92rem", color: "#1A2B5E" }}>{option.name}</Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8" }} noWrap>{option.address} · {option.phone}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                );
              }}
              value={selectedCustomer}
              onChange={handleCustomerChange}
              renderInput={(params) => (
                <TextField {...params} label="Search Customer" placeholder="Type name, CS-001, address or phone…" />
              )}
              ListboxProps={{ sx: { p: 0, maxHeight: 320 } }}
              noOptionsText="No customers found"
            />
          </Stack>
        </Paper>

        {selectedCustomer ? (
          <>
            {/* Customer identity */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Chip label={selectedCustomer.clientId} sx={{ fontWeight: 700, bgcolor: "#EEF2FF", color: "#2D46C4", border: "1px solid #BFD0F7" }} />
              <Typography variant="h6" sx={{ color: "#1A2B5E" }}>{selectedCustomer.name}</Typography>
              {existingEntry && <Chip label="Has entry" size="small" color="warning" />}
            </Stack>

            {/* Session cards */}
            {(["morning", "evening"]).map((sk, i) => {
              const cfg = S[sk];
              const isActive = sk === activeSession;
              const isSaved = !editing[sk] && sessionSaved[sk] != null;
              const isOffSess = isSaved && sessionSaved[sk]?.offSession;

              return (
                <Paper key={sk} sx={{
                  mb: 2,
                  border: isActive ? `2px solid ${cfg.border}` : "1.5px solid #E2E8F7",
                  borderRadius: "14px",
                  bgcolor: isActive ? cfg.bg : "#FAFBFF",
                  overflow: "hidden",
                  animation: `fadeSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) ${0.12 + i * 0.1}s both`,
                  transition: "border-color 220ms",
                }}>
                  {/* Card header */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between"
                    sx={{ px: { xs: 2, sm: 2.5 }, pt: 2, pb: isSaved ? 1.5 : 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <cfg.Icon size={20} color={isActive ? cfg.accent : "#94A3B8"} />
                      <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: isActive ? cfg.accent : "#6B7A99" }}>
                        {cfg.label}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {isActive && !isSaved && (
                        <Chip label="Current session" size="small"
                          sx={{ bgcolor: cfg.chipBg, color: cfg.accent, border: `1px solid ${cfg.border}`, fontWeight: 600, fontSize: "0.72rem" }} />
                      )}
                      {!isActive && !isSaved && (
                        <Typography sx={{ fontSize: "0.74rem", color: "#94A3B8" }}>
                          {sk === "morning" ? "Before noon IST" : "After noon IST"}
                        </Typography>
                      )}
                      {isSaved && (
                        <Chip icon={<MdCheckCircle size={13} />} label="Saved"
                          sx={{ bgcolor: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0", fontWeight: 600, fontSize: "0.72rem" }} />
                      )}
                      {isSaved && (
                        <Tooltip title={`Edit ${cfg.label}`}>
                          <IconButton size="small" onClick={() => handleEdit(sk)}
                            sx={{ color: "#4361EE", bgcolor: "#EEF2FF", "&:hover": { bgcolor: "#dbeafe" } }}>
                            <MdEdit size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>

                  {/* Saved state — compact display */}
                  {isSaved && (
                    <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: 2 }}>
                      <Typography sx={{ fontSize: "1.8rem", fontWeight: 700, color: cfg.accent, lineHeight: 1 }}>
                        {formatLiters(sessionSaved[sk].litres)}
                      </Typography>
                      {sessionSaved[sk].litres === 0 && (
                        <Typography sx={{ fontSize: "0.8rem", color: "#94A3B8", mt: 0.25 }}>No delivery</Typography>
                      )}
                      {isOffSess && (
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.75 }}>
                          <MdInfo size={13} color="#b45309" />
                          <Typography sx={{ fontSize: "0.74rem", color: "#b45309" }}>
                            Saved outside normal {cfg.label.toLowerCase()} hours ({SESSION_WINDOW[sk]})
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                  )}

                  {/* Input state */}
                  {!isSaved && (
                    <Box sx={{ px: { xs: 2, sm: 2.5 }, pt: 1.5, pb: 2 }}>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "flex-end" }}>
                        <TextField
                          label={`Litres delivered (${cfg.label})`}
                          type="number"
                          value={form[sk]}
                          onChange={(e) => setForm((f) => ({ ...f, [sk]: e.target.value }))}
                          inputProps={{ min: 0, step: "0.25" }}
                          helperText={`Default: ${sk === "morning" ? selectedCustomer.morningLitres : selectedCustomer.eveningLitres} L  ·  0 = no delivery`}
                          sx={{ flex: 1 }}
                          autoFocus={isActive && i === 0}
                        />
                        <Button
                          variant={isActive ? "contained" : "outlined"}
                          startIcon={<MdSave />}
                          onClick={() => handleSaveSession(sk)}
                          sx={{ minWidth: 160, py: 1.4, borderRadius: "10px", mb: { xs: 0, sm: "20px" } }}
                        >
                          Save {cfg.label}
                        </Button>
                      </Stack>
                      {!isActive && (
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.75 }}>
                          <MdInfo size={13} color="#94A3B8" />
                          <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>
                            Outside normal hours — will be flagged as override
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                  )}
                </Paper>
              );
            })}

            {/* Total when both saved */}
            {sessionSaved.morning != null && sessionSaved.evening != null && (
              <Paper sx={{ p: 2, border: "1.5px solid #BFD0F7", borderRadius: "14px", background: "linear-gradient(135deg,#EEF2FF,#F8F9FF)", animation: "scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack spacing={0}>
                    <Typography sx={{ fontSize: "0.78rem", color: "#6B7A99", fontWeight: 600 }}>Total Today</Typography>
                    <Typography sx={{ fontSize: "1.8rem", fontWeight: 700, color: "#1A2B5E", lineHeight: 1.1 }}>
                      {formatLiters(totalSaved)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    {savedMorning > 0 && (
                      <Chip size="small" icon={<MdWbSunny size={12} />} label={formatLiters(savedMorning)}
                        sx={{ bgcolor: "#fff8e1", color: "#b45309", border: "1px solid #fde68a", fontWeight: 600 }} />
                    )}
                    {savedEvening > 0 && (
                      <Chip size="small" icon={<MdNightsStay size={12} />} label={formatLiters(savedEvening)}
                        sx={{ bgcolor: "#ede9fe", color: "#5b21b6", border: "1px solid #c4b5fd", fontWeight: 600 }} />
                    )}
                  </Stack>
                </Stack>
              </Paper>
            )}
          </>
        ) : (
          <Paper sx={{ p: 5, border: "1.5px dashed #BFD0F7", borderRadius: "16px", textAlign: "center", bgcolor: "#FAFBFF" }}>
            <MdLocalShipping size={40} color="#BFD0F7" />
            <Typography sx={{ color: "#94A3B8", fontWeight: 600, mt: 1.5 }}>Select a customer above</Typography>
            <Typography sx={{ color: "#BDC8E2", fontSize: "0.82rem" }}>Search by name, ID, address or phone</Typography>
          </Paper>
        )}

        {/* Today's summary table */}
        {todayEntries.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 2.5 }} />
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
              <Typography variant="h6" sx={{ color: "#1A2B5E" }}>{formatDate(selectedDate)} — All Deliveries</Typography>
              <Chip label={`${todayEntries.length} customers`} size="small" color="primary" variant="outlined" />
            </Stack>
            <TableContainer component={Paper} sx={{ borderRadius: "12px", border: "1px solid #E2E8F7", overflow: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="center"><Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5}><MdWbSunny size={13} color="#b45309" /><span>Morning</span></Stack></TableCell>
                    <TableCell align="center"><Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5}><MdNightsStay size={13} color="#5b21b6" /><span>Evening</span></Stack></TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todayEntries.map((entry, i) => {
                    const customer = deliveryCustomers.find((c) => c.id === entry.customerId);
                    const isCurrent = selectedCustomer?.id === entry.customerId;
                    return (
                      <TableRow key={entry.id} onClick={() => handleCustomerChange(null, customer)}
                        sx={{ cursor: "pointer", bgcolor: isCurrent ? "#EEF2FF" : i % 2 === 0 ? "#fff" : "#F8FAFF", outline: isCurrent ? "2px solid #4361EE" : "none", outlineOffset: "-1px", "&:hover": { bgcolor: "#EEF2FF" } }}>
                        <TableCell>
                          <Chip label={customer?.clientId || "—"} size="small"
                            sx={{ fontWeight: 600, fontSize: "0.72rem", bgcolor: "#EEF2FF", color: "#2D46C4", border: "1px solid #BFD0F7" }} />
                        </TableCell>
                        <TableCell><Typography sx={{ fontWeight: 600, fontSize: "0.88rem" }}>{customer?.name || "Unknown"}</Typography></TableCell>
                        <TableCell align="center">
                          {entry.morning.litres > 0
                            ? <Chip label={formatLiters(entry.morning.litres)} size="small" sx={{ bgcolor: "#fff8e1", color: "#b45309", border: "1px solid #fde68a", fontWeight: 600 }} />
                            : <Typography sx={{ color: "#CBD5E1" }}>—</Typography>}
                        </TableCell>
                        <TableCell align="center">
                          {entry.evening.litres > 0
                            ? <Chip label={formatLiters(entry.evening.litres)} size="small" sx={{ bgcolor: "#ede9fe", color: "#5b21b6", border: "1px solid #c4b5fd", fontWeight: 600 }} />
                            : <Typography sx={{ color: "#CBD5E1" }}>—</Typography>}
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontWeight: 700, color: entry.totalLitres > 0 ? "#1A2B5E" : "#CBD5E1" }}>
                            {entry.totalLitres > 0 ? formatLiters(entry.totalLitres) : "—"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography sx={{ fontSize: "0.74rem", color: "#94A3B8", mt: 1, textAlign: "right" }}>Tap a row to load that customer</Typography>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}
