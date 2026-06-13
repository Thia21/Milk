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
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdAdd, MdDelete, MdEdit, MdHome, MdSearch } from "react-icons/md";
import DataTable from "../../components/DataTable.jsx";
import { createId } from "../../utils/calculations.js";
import { formatCurrency } from "../../utils/formatters.js";

const emptyCustomer = {
  clientId: "",
  name: "",
  address: "",
  phone: "",
  morningLitres: "0.5",
  eveningLitres: "0.5",
  subscriptionAmount: "4000",
  isActive: true,
};

export default function DeliveryCustomers() {
  const { deliveryCustomers, setDeliveryCustomers } = useOutletContext();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyCustomer);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return deliveryCustomers;
    return deliveryCustomers.filter((c) =>
      [c.clientId, c.name, c.address, c.phone].join(" ").toLowerCase().includes(query)
    );
  }, [deliveryCustomers, search]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyCustomer);
    setDialogOpen(true);
  };

  const openEdit = (customer) => {
    setEditingId(customer.id);
    setForm({
      clientId: customer.clientId,
      name: customer.name,
      address: customer.address,
      phone: customer.phone,
      morningLitres: String(customer.morningLitres),
      eveningLitres: String(customer.eveningLitres),
      subscriptionAmount: String(customer.subscriptionAmount),
      isActive: customer.isActive,
    });
    setDialogOpen(true);
  };

  const handleChange = (field) => (event) => {
    setForm((c) => ({ ...c, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = {
      ...form,
      morningLitres: Number(form.morningLitres) || 0.5,
      eveningLitres: Number(form.eveningLitres) || 0.5,
      subscriptionAmount: Number(form.subscriptionAmount) || 4000,
      isActive: form.isActive === true || form.isActive === "true",
    };

    if (editingId) {
      setDeliveryCustomers((current) =>
        current.map((c) => (c.id === editingId ? { ...c, ...data, updatedAt: new Date().toISOString() } : c))
      );
    } else {
      setDeliveryCustomers((current) => [
        { ...data, id: createId("dcust"), createdAt: new Date().toISOString() },
        ...current,
      ]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this customer? Their delivery entries and subscriptions will remain.")) return;
    setDeliveryCustomers((current) => current.filter((c) => c.id !== id));
  };

  const columns = [
    {
      id: "house",
      label: "Client ID",
      minWidth: 80,
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              width: 34,
              height: 34,
              borderRadius: "8px",
              background: "linear-gradient(135deg, #3DB54A, #00C49A)",
              color: "#fff",
              fontSize: "0.72rem",
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            <MdHome size={16} />
          </Box>
          <Typography className="table-title">{row.clientId}</Typography>
        </Box>
      ),
    },
    {
      id: "name",
      label: "Customer",
      minWidth: 200,
      render: (row) => (
        <Box>
          <Typography className="table-title">{row.name}</Typography>
          <Typography className="table-subtitle">{row.address}</Typography>
        </Box>
      ),
    },
    { id: "phone", label: "Phone", minWidth: 130 },
    {
      id: "litres",
      label: "Default Litres",
      render: (row) => (
        <Box>
          <Typography className="table-title" sx={{ fontSize: "0.86rem !important" }}>
            {row.morningLitres} L morn Â· {row.eveningLitres} L eve
          </Typography>
          <Typography className="table-subtitle">
            {Number(row.morningLitres) + Number(row.eveningLitres)} L / day
          </Typography>
        </Box>
      ),
    },
    {
      id: "subscriptionAmount",
      label: "Subscription",
      render: (row) => (
        <Typography className="table-title">{formatCurrency(row.subscriptionAmount)} / mo</Typography>
      ),
    },
    {
      id: "isActive",
      label: "Status",
      render: (row) => (
        <Chip
          label={row.isActive ? "Active" : "Inactive"}
          color={row.isActive ? "success" : "default"}
          size="small"
          variant={row.isActive ? "filled" : "outlined"}
        />
      ),
    },
    {
      id: "actions",
      label: "Actions",
      align: "right",
      render: (row) => (
        <span className="table-actions">
          <Tooltip title="Edit">
            <IconButton color="primary" onClick={() => openEdit(row)}>
              <MdEdit size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton color="error" onClick={() => handleDelete(row.id)}>
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
          <Typography component="h1">Delivery Customers</Typography>
          <Typography>Manage the 20 households your milk delivery covers daily.</Typography>
        </Box>
        <Button variant="contained" startIcon={<MdAdd />} onClick={openAdd}>
          Add Customer
        </Button>
      </Box>

      <Box className="toolbar-row">
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by house, name, phone, address"
          size="small"
          sx={{ width: { xs: "100%", sm: 420 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MdSearch size={20} />
              </InputAdornment>
            ),
          }}
        />
        <Stack direction="row" spacing={1}>
          <Chip
            label={`${deliveryCustomers.filter((c) => c.isActive).length} active`}
            color="success"
            size="small"
            variant="outlined"
          />
          <Chip label={`${filtered.length} shown`} color="primary" size="small" variant="outlined" />
        </Stack>
      </Box>

      <DataTable columns={columns} rows={filtered} emptyMessage="No customers match your search." />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{editingId ? "Edit Customer" : "Add Delivery Customer"}</DialogTitle>
          <DialogContent>
            <Box className="form-grid" sx={{ mt: 1 }}>
              <TextField
                label="Client Subscription ID"
                value={form.clientId}
                onChange={handleChange("clientId")}
                placeholder="H-01"
                required
              />
              <TextField
                label="Customer Name"
                value={form.name}
                onChange={handleChange("name")}
                required
              />
              <TextField
                label="Phone"
                value={form.phone}
                onChange={handleChange("phone")}
                inputProps={{ maxLength: 10 }}
                required
              />
              <TextField
                label="Subscription (â‚¹ / month)"
                type="number"
                value={form.subscriptionAmount}
                onChange={handleChange("subscriptionAmount")}
                inputProps={{ min: 0 }}
                required
              />
              <TextField
                label="Morning Litres"
                type="number"
                value={form.morningLitres}
                onChange={handleChange("morningLitres")}
                inputProps={{ min: 0, step: "0.25" }}
                required
              />
              <TextField
                label="Evening Litres"
                type="number"
                value={form.eveningLitres}
                onChange={handleChange("eveningLitres")}
                inputProps={{ min: 0, step: "0.25" }}
                required
              />
              <TextField
                className="full-span"
                label="Address"
                value={form.address}
                onChange={handleChange("address")}
                required
              />
              <TextField select label="Status" value={String(form.isActive)} onChange={handleChange("isActive")}>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingId ? "Update Customer" : "Save Customer"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
