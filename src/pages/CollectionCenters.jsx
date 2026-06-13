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
import { MdAdd, MdDelete, MdEdit, MdSearch } from "react-icons/md";
import DataTable from "../components/DataTable.jsx";
import { createId } from "../utils/calculations.js";

const emptyCenter = {
  centerName: "",
  ownerName: "",
  mobileNumber: "",
  village: "",
  address: "",
  status: "Active",
};

export default function CollectionCenters() {
  const { centers, setCenters } = useOutletContext();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyCenter);

  const filteredCenters = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return centers;
    }

    return centers.filter((center) =>
      [
        center.centerName,
        center.ownerName,
        center.mobileNumber,
        center.village,
        center.address,
        center.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [centers, search]);

  const openAddDialog = () => {
    setEditingId(null);
    setForm(emptyCenter);
    setDialogOpen(true);
  };

  const openEditDialog = (center) => {
    setEditingId(center.id);
    setForm({
      centerName: center.centerName,
      ownerName: center.ownerName,
      mobileNumber: center.mobileNumber,
      village: center.village,
      address: center.address,
      status: center.status,
    });
    setDialogOpen(true);
  };

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (editingId) {
      setCenters((current) =>
        current.map((center) =>
          center.id === editingId ? { ...center, ...form, updatedAt: new Date().toISOString() } : center
        )
      );
    } else {
      setCenters((current) => [
        {
          ...form,
          id: createId("center"),
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
    }

    setDialogOpen(false);
  };

  const handleDelete = (centerId) => {
    const shouldDelete = window.confirm("Delete this collection center?");
    if (!shouldDelete) {
      return;
    }

    setCenters((current) => current.filter((center) => center.id !== centerId));
  };

  const columns = [
    {
      id: "centerName",
      label: "Center",
      minWidth: 210,
      render: (row) => (
        <Box>
          <Typography className="table-title">{row.centerName}</Typography>
          <Typography className="table-subtitle">{row.village}</Typography>
        </Box>
      ),
    },
    { id: "ownerName", label: "Owner", minWidth: 160 },
    { id: "mobileNumber", label: "Mobile", minWidth: 130 },
    { id: "address", label: "Address", minWidth: 240 },
    {
      id: "status",
      label: "Status",
      render: (row) => (
        <Chip
          label={row.status}
          color={row.status === "Active" ? "success" : "default"}
          size="small"
          variant={row.status === "Active" ? "filled" : "outlined"}
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
            <IconButton aria-label="Edit center" color="primary" onClick={() => openEditDialog(row)}>
              <MdEdit size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton aria-label="Delete center" color="error" onClick={() => handleDelete(row.id)}>
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
          <Typography component="h1">Collection Center Management</Typography>
          <Typography>Add, edit, search, and maintain every milk collection center.</Typography>
        </Box>
        <Button variant="contained" startIcon={<MdAdd />} onClick={openAddDialog}>
          Add Center
        </Button>
      </Box>

      <Box className="toolbar-row">
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search center, owner, village, mobile"
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
          <Chip label={`${filteredCenters.length} records`} color="primary" variant="outlined" />
        </Stack>
      </Box>

      <DataTable columns={columns} rows={filteredCenters} emptyMessage="No collection centers match your search." />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{editingId ? "Edit Collection Center" : "Add Collection Center"}</DialogTitle>
          <DialogContent>
            <Box className="form-grid" sx={{ mt: 1 }}>
              <TextField
                label="Center Name"
                value={form.centerName}
                onChange={handleChange("centerName")}
                required
              />
              <TextField
                label="Owner Name"
                value={form.ownerName}
                onChange={handleChange("ownerName")}
                required
              />
              <TextField
                label="Mobile Number"
                value={form.mobileNumber}
                onChange={handleChange("mobileNumber")}
                inputProps={{ maxLength: 10 }}
                required
              />
              <TextField label="Village" value={form.village} onChange={handleChange("village")} required />
              <TextField
                className="full-span"
                label="Address"
                value={form.address}
                onChange={handleChange("address")}
                minRows={3}
                multiline
                required
              />
              <TextField select label="Status" value={form.status} onChange={handleChange("status")}>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingId ? "Update Center" : "Save Center"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
