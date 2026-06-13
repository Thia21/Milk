import { useMemo, useState } from "react";
import {
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
  MdLocalDrink,
  MdNightsStay,
  MdSave,
  MdWbSunny,
} from "react-icons/md";
import { useCollection } from "./hooks/useCollection.js";
import { useDocument } from "./hooks/useDocument.js";
import { initialSettings } from "./services/seedData.js";
import {
  createId,
  getCenterName,
  normalizeMilkEntry,
  roundMoney,
  toNumber,
} from "./utils/calculations.js";
import { toInputDate } from "./utils/dateUtils.js";
import { formatCurrency, formatDate, formatLiters } from "./utils/formatters.js";
import { getActiveSession, getISTTimeString, SESSION_WINDOW } from "./utils/timeUtils.js";
import AppNav from "./components/AppNav.jsx";
import { theme } from "./theme.js";
import "./index.css";

const S = {
  morning: { key: "morning", label: "Morning", Icon: MdWbSunny,    accent: "#b45309", bg: "#fffdf4", border: "#fde68a", chipBg: "#fff8e1" },
  evening: { key: "evening", label: "Evening", Icon: MdNightsStay, accent: "#5b21b6", bg: "#faf9ff", border: "#c4b5fd", chipBg: "#ede9fe" },
};

function loadFormFromEntry(center, entries, date, defaultRate) {
  const existing = entries.find((e) => e.date === date && e.centerId === center?.id);
  return {
    morning: { liters: existing ? String(existing.morning.liters) : "", rate: existing ? String(existing.morning.rate) : String(defaultRate) },
    evening: { liters: existing ? String(existing.evening.liters) : "", rate: existing ? String(existing.evening.rate) : String(defaultRate) },
    existingId:      existing?.id ?? null,
    existingMorning: existing ? { liters: existing.morning.liters, rate: existing.morning.rate } : null,
    existingEvening: existing ? { liters: existing.evening.liters, rate: existing.evening.rate } : null,
    createdAt:       existing?.createdAt ?? null,
  };
}

export default function CollectionEntryApp() {
  const [centers]          = useCollection("centers");
  const [entries, setEntries] = useCollection("milkEntries");
  const [settings]         = useDocument("appSettings", "main", initialSettings);

  const activeCenters = useMemo(() => centers.filter((c) => c.status === "Active"), [centers]);

  const today = toInputDate();
  const activeSession = getActiveSession();
  const istTime = getISTTimeString();

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [form, setForm] = useState({
    morning: { liters: "", rate: String(settings.defaultMilkRate) },
    evening: { liters: "", rate: String(settings.defaultMilkRate) },
  });
  const [sessionSaved, setSessionSaved] = useState({ morning: null, evening: null });
  const [editing, setEditing] = useState({ morning: true, evening: true });

  const resetForCenter = (center, date, entriesArr) => {
    if (!center) {
      setForm({ morning: { liters: "", rate: String(settings.defaultMilkRate) }, evening: { liters: "", rate: String(settings.defaultMilkRate) } });
      setSessionSaved({ morning: null, evening: null });
      setEditing({ morning: true, evening: true });
      return;
    }
    const f = loadFormFromEntry(center, entriesArr, date, settings.defaultMilkRate);
    setForm({ morning: f.morning, evening: f.evening });
    setSessionSaved({
      morning: f.existingMorning,
      evening: f.existingEvening,
    });
    setEditing({
      morning: !f.existingMorning,
      evening: !f.existingEvening,
    });
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (selectedCenter) resetForCenter(selectedCenter, newDate, entries);
  };

  const handleCenterChange = (_, center) => {
    setSelectedCenter(center);
    resetForCenter(center, selectedDate, entries);
  };

  const handleSaveSession = (sk) => {
    if (!selectedCenter) return;
    const liters = roundMoney(toNumber(form[sk].liters));
    const rate   = toNumber(form[sk].rate);
    if (liters === 0) return;
    const isOffSession = sk !== activeSession;

    const otherKey = sk === "morning" ? "evening" : "morning";
    const existing = entries.find((e) => e.date === selectedDate && e.centerId === selectedCenter.id);
    const otherLiters = existing?.[otherKey].liters ?? roundMoney(toNumber(form[otherKey].liters));
    const otherRate   = existing?.[otherKey].rate   ?? toNumber(form[otherKey].rate);

    const morningData = sk === "morning" ? { liters, rate } : { liters: otherLiters, rate: otherRate };
    const eveningData = sk === "evening" ? { liters, rate } : { liters: otherLiters, rate: otherRate };

    const newEntry = normalizeMilkEntry({
      id:        existing?.id || createId("entry"),
      centerId:  selectedCenter.id,
      date:      selectedDate,
      morning:   morningData,
      evening:   eveningData,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setEntries((cur) =>
      existing ? cur.map((e) => (e.id === existing.id ? newEntry : e)) : [newEntry, ...cur]
    );
    setSessionSaved((prev) => ({ ...prev, [sk]: { liters, rate, amount: roundMoney(liters * rate), offSession: isOffSession } }));
    setEditing((prev) => ({ ...prev, [sk]: false }));
  };

  const handleEdit = (sk) => {
    setEditing((prev) => ({ ...prev, [sk]: true }));
    setSessionSaved((prev) => ({ ...prev, [sk]: null }));
  };

  const existingEntry = selectedCenter
    ? entries.find((e) => e.date === selectedDate && e.centerId === selectedCenter.id)
    : null;

  const savedML = sessionSaved.morning?.liters ?? 0;
  const savedEL = sessionSaved.evening?.liters ?? 0;
  const savedMA = sessionSaved.morning?.amount ?? 0;
  const savedEA = sessionSaved.evening?.amount ?? 0;

  const todayEntries = useMemo(
    () =>
      [...entries.filter((e) => e.date === selectedDate)].sort((a, b) =>
        getCenterName(centers, a.centerId).localeCompare(getCenterName(centers, b.centerId))
      ),
    [entries, selectedDate, centers]
  );

  const activeCfg = S[activeSession];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppNav current="collection" />

      <Box sx={{ maxWidth: 820, mx: "auto", px: { xs: 2, sm: 3 }, pt: { xs: 9, sm: 10 }, pb: 6 }}>

        {/* Header */}
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between"
          sx={{ mb: 3, gap: 1.5, animation: "fadeSlideUp 0.38s cubic-bezier(0.22,1,0.36,1) both" }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 44, height: 44, borderRadius: "12px", background: "linear-gradient(135deg,#b45309,#f9ab00)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <MdLocalDrink size={22} color="#fff" />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#1A2B5E", lineHeight: 1.15 }}>Collection Entry</Typography>
              <Typography sx={{ color: "#6B7A99", fontSize: "0.85rem" }}>Save morning &amp; evening per centre</Typography>
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

        {/* Date + Centre search */}
        <Paper sx={{ p: { xs: 2, sm: 2.5 }, mb: 2.5, border: "1px solid #E2E8F7", borderRadius: "16px", animation: "fadeSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) 0.08s both" }}>
          <Stack spacing={2}>
            <TextField label="Collection Date" type="date" value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
            <Autocomplete
              options={activeCenters}
              getOptionLabel={(c) => c.centerName}
              filterOptions={(opts, { inputValue }) => {
                const q = inputValue.toLowerCase();
                return opts.filter((o) =>
                  o.centerName.toLowerCase().includes(q) ||
                  o.village.toLowerCase().includes(q) ||
                  o.ownerName.toLowerCase().includes(q)
                );
              }}
              renderOption={(props, option) => {
                const { key, ...liProps } = props;
                return (
                  <Box key={key} component="li" {...liProps}
                    sx={{ px: 2, py: 1.25, borderBottom: "1px solid #F0F4FF", "&:last-child": { borderBottom: 0 }, "&.Mui-focused": { bgcolor: "#EEF2FF" } }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.92rem", color: "#1A2B5E" }}>{option.centerName}</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>{option.village} · {option.ownerName}</Typography>
                  </Box>
                );
              }}
              value={selectedCenter}
              onChange={handleCenterChange}
              renderInput={(params) => (
                <TextField {...params} label="Search & Select Collection Centre" placeholder="Type centre name, village, or owner…" />
              )}
              ListboxProps={{ sx: { p: 0, maxHeight: 320 } }}
              noOptionsText="No centres match"
            />
          </Stack>
        </Paper>

        {selectedCenter ? (
          <>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ color: "#1A2B5E" }}>{selectedCenter.centerName}</Typography>
              <Chip label={selectedCenter.village} size="small" variant="outlined" />
              {existingEntry && <Chip label="Has entry — editing" size="small" color="warning" />}
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
                }}>
                  {/* Card header */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between"
                    sx={{ px: { xs: 2, sm: 2.5 }, pt: 2, pb: isSaved ? 1.5 : 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <cfg.Icon size={20} color={isActive ? cfg.accent : "#94A3B8"} />
                      <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: isActive ? cfg.accent : "#6B7A99" }}>
                        {cfg.label} Session
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

                  {/* Saved state */}
                  {isSaved && (
                    <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: 2 }}>
                      <Stack direction="row" alignItems="flex-end" spacing={3}>
                        <Box>
                          <Typography sx={{ fontSize: "0.72rem", color: "#6B7A99", fontWeight: 600 }}>Litres</Typography>
                          <Typography sx={{ fontSize: "1.8rem", fontWeight: 700, color: cfg.accent, lineHeight: 1 }}>
                            {formatLiters(sessionSaved[sk].liters)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: "0.72rem", color: "#6B7A99", fontWeight: 600 }}>Rate</Typography>
                          <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: "#1A2B5E" }}>₹{sessionSaved[sk].rate}/L</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: "0.72rem", color: "#6B7A99", fontWeight: 600 }}>Amount</Typography>
                          <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#22C55E" }}>{formatCurrency(sessionSaved[sk].amount)}</Typography>
                        </Box>
                      </Stack>
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
                        <TextField label="Litres" type="number" value={form[sk].liters}
                          onChange={(e) => setForm((f) => ({ ...f, [sk]: { ...f[sk], liters: e.target.value } }))}
                          inputProps={{ min: 0, step: "0.01" }} sx={{ flex: 1 }}
                          autoFocus={isActive && i === 0} />
                        <TextField label="Rate per Litre (₹)" type="number" value={form[sk].rate}
                          onChange={(e) => setForm((f) => ({ ...f, [sk]: { ...f[sk], rate: e.target.value } }))}
                          inputProps={{ min: 0, step: "0.01" }} sx={{ flex: 1 }} />
                        <Button
                          variant={isActive ? "contained" : "outlined"}
                          startIcon={<MdSave />}
                          onClick={() => handleSaveSession(sk)}
                          disabled={toNumber(form[sk].liters) === 0}
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
                <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={1.5}>
                  <Stack direction="row" spacing={4}>
                    <Box>
                      <Typography sx={{ fontSize: "0.72rem", color: "#6B7A99", fontWeight: 600 }}>Total Litres</Typography>
                      <Typography sx={{ fontSize: "1.6rem", fontWeight: 700, color: "#1A2B5E", lineHeight: 1 }}>{formatLiters(savedML + savedEL)}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.72rem", color: "#6B7A99", fontWeight: 600 }}>Total Amount</Typography>
                      <Typography sx={{ fontSize: "1.6rem", fontWeight: 700, color: "#22C55E", lineHeight: 1 }}>{formatCurrency(savedMA + savedEA)}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    {savedML > 0 && <Chip size="small" label={`M: ${formatLiters(savedML)}`} sx={{ bgcolor: "#fff8e1", color: "#b45309", border: "1px solid #fde68a", fontWeight: 600 }} />}
                    {savedEL > 0 && <Chip size="small" label={`E: ${formatLiters(savedEL)}`} sx={{ bgcolor: "#ede9fe", color: "#5b21b6", border: "1px solid #c4b5fd", fontWeight: 600 }} />}
                  </Stack>
                </Stack>
              </Paper>
            )}
          </>
        ) : (
          <Paper sx={{ p: 5, border: "1.5px dashed #BFD0F7", borderRadius: "16px", textAlign: "center", bgcolor: "#FAFBFF" }}>
            <MdLocalDrink size={40} color="#BFD0F7" />
            <Typography sx={{ color: "#94A3B8", fontWeight: 600, mt: 1.5 }}>Select a collection centre above</Typography>
            <Typography sx={{ color: "#BDC8E2", fontSize: "0.82rem" }}>Search by name, village, or owner</Typography>
          </Paper>
        )}

        {/* Today's summary table */}
        {todayEntries.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 2.5 }} />
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
              <Typography variant="h6" sx={{ color: "#1A2B5E" }}>{formatDate(selectedDate)} — All Entries</Typography>
              <Chip label={`${todayEntries.length} centres`} size="small" color="primary" variant="outlined" />
            </Stack>
            <TableContainer component={Paper} sx={{ borderRadius: "12px", border: "1px solid #E2E8F7", overflow: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Centre</TableCell>
                    <TableCell><Stack direction="row" alignItems="center" spacing={0.5}><MdWbSunny size={13} color="#b45309" /><span>Morning</span></Stack></TableCell>
                    <TableCell><Stack direction="row" alignItems="center" spacing={0.5}><MdNightsStay size={13} color="#5b21b6" /><span>Evening</span></Stack></TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todayEntries.map((entry, i) => (
                    <TableRow key={entry.id}
                      onClick={() => handleCenterChange(null, centers.find((c) => c.id === entry.centerId))}
                      sx={{ cursor: "pointer", bgcolor: i % 2 === 0 ? "#fff" : "#F8FAFF", outline: selectedCenter?.id === entry.centerId ? "2px solid #4361EE" : "none", outlineOffset: "-1px", "&:hover": { bgcolor: "#EEF2FF" } }}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", color: "#1A2B5E" }}>{getCenterName(centers, entry.centerId)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "0.85rem", color: "#b45309", fontWeight: 600 }}>{formatLiters(entry.morning.liters)}</Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: "#6B7A99" }}>₹{entry.morning.rate}/L</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "0.85rem", color: "#5b21b6", fontWeight: 600 }}>{formatLiters(entry.evening.liters)}</Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: "#6B7A99" }}>₹{entry.evening.rate}/L</Typography>
                      </TableCell>
                      <TableCell><Typography sx={{ fontWeight: 700, color: "#1A2B5E" }}>{formatLiters(entry.totalLiters)}</Typography></TableCell>
                      <TableCell align="right"><Typography sx={{ fontWeight: 700, color: "#22C55E" }}>{formatCurrency(entry.totalAmount)}</Typography></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography sx={{ fontSize: "0.74rem", color: "#94A3B8", mt: 1, textAlign: "right" }}>Tap a row to load that centre</Typography>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}
