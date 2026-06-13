import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import DataTable from "../components/DataTable.jsx";
import { calculateEntryTotals, createId, getCenterName, normalizeMilkEntry } from "../utils/calculations.js";
import { compareDateDesc, toInputDate } from "../utils/dateUtils.js";
import { formatCurrency, formatDate, formatLiters } from "../utils/formatters.js";

function createEmptyEntry(centers, defaultRate) {
  return {
    date: toInputDate(),
    centerId: centers[0]?.id || "",
    morning: { liters: "", rate: defaultRate },
    evening: { liters: "", rate: defaultRate },
  };
}

export default function MilkEntries() {
  const { centers, entries, setEntries, settings } = useOutletContext();
  const activeCenters = centers.filter((center) => center.status === "Active");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => createEmptyEntry(activeCenters, settings.defaultMilkRate));

  const sortedEntries = useMemo(() => [...entries].sort(compareDateDesc), [entries]);
  const totals = calculateEntryTotals(form);

  const openAddDialog = () => {
    setEditingId(null);
    setForm(createEmptyEntry(activeCenters, settings.defaultMilkRate));
    setDialogOpen(true);
  };

  const openEditDialog = (entry) => {
    setEditingId(entry.id);
    setForm({
      date: entry.date,
      centerId: entry.centerId,
      morning: { ...entry.morning },
      evening: { ...entry.evening },
    });
    setDialogOpen(true);
  };

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const updateSessionField = (session, field) => (event) => {
    setForm((current) => ({
      ...current,
      [session]: {
        ...current[session],
        [field]: event.target.value,
      },
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedEntry = normalizeMilkEntry({
      ...form,
      id: editingId || createId("entry"),
      updatedAt: new Date().toISOString(),
    });

    if (editingId) {
      setEntries((current) =>
        current.map((entry) => (entry.id === editingId ? { ...entry, ...normalizedEntry } : entry))
      );
    } else {
      setEntries((current) => [{ ...normalizedEntry, createdAt: new Date().toISOString() }, ...current]);
    }

    setDialogOpen(false);
  };

  const handleDelete = (entryId) => {
    const shouldDelete = window.confirm("Delete this milk collection entry?");
    if (!shouldDelete) {
      return;
    }

    setEntries((current) => current.filter((entry) => entry.id !== entryId));
  };

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
      id: "morning",
      label: "Morning",
      render: (row) => (
        <Box>
          <Typography className="table-title">{formatLiters(row.morning.liters)}</Typography>
          <Typography className="table-subtitle">₹{row.morning.rate}/L</Typography>
        </Box>
      ),
      minWidth: 140,
    },
    {
      id: "evening",
      label: "Evening",
      render: (row) => (
        <Box>
          <Typography className="table-title">{formatLiters(row.evening.liters)}</Typography>
          <Typography className="table-subtitle">₹{row.evening.rate}/L</Typography>
        </Box>
      ),
      minWidth: 140,
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
    {
      id: "actions",
      label: "Actions",
      align: "right",
      render: (row) => (
        <span className="table-actions">
          <Tooltip title="Edit">
            <IconButton aria-label="Edit entry" color="primary" onClick={() => openEditDialog(row)}>
              <MdEdit size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton aria-label="Delete entry" color="error" onClick={() => handleDelete(row.id)}>
              <MdDelete size={20} />
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
          <Typography component="h1">Daily Milk Collection Entry</Typography>
          <Typography>Record morning and evening milk collection with automatic totals.</Typography>
        </Box>
        <Button variant="contained" startIcon={<MdAdd />} onClick={openAddDialog} disabled={!activeCenters.length}>
          Add Entry
        </Button>
      </Box>

      <DataTable columns={columns} rows={sortedEntries} emptyMessage="No milk entries available." />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{editingId ? "Edit Milk Entry" : "Add Milk Entry"}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date"
                  type="date"
                  value={form.date}
                  onChange={updateField("date")}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Collection Center"
                  value={form.centerId}
                  onChange={updateField("centerId")}
                  fullWidth
                  required
                >
                  {activeCenters.map((center) => (
                    <MenuItem key={center.id} value={center.id}>
                      {center.centerName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              {["morning", "evening"].map((session) => (
                <Grid item xs={12} md={6} key={session}>
                  <Paper variant="outlined" className="session-card">
                    <Typography variant="h6" sx={{ textTransform: "capitalize", mb: 2 }}>
                      {session} Session
                    </Typography>
                    <Box className="form-grid">
                      <TextField
                        label="Liters"
                        type="number"
                        value={form[session].liters}
                        onChange={updateSessionField(session, "liters")}
                        inputProps={{ min: 0, step: "0.01" }}
                        required
                      />
                      <TextField
                        label="Rate Per Liter (₹)"
                        type="number"
                        value={form[session].rate}
                        onChange={updateSessionField(session, "rate")}
                        inputProps={{ min: 0, step: "0.01" }}
                        required
                      />
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 2.5 }} />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Paper variant="outlined" className="calculation-tile">
                <Typography>Total Liters</Typography>
                <strong>{formatLiters(totals.totalLiters)}</strong>
              </Paper>
              <Paper variant="outlined" className="calculation-tile">
                <Typography>Total Amount</Typography>
                <strong>{formatCurrency(totals.totalAmount)}</strong>
              </Paper>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingId ? "Update Entry" : "Save Entry"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
