import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { MdSave } from "react-icons/md";

export default function Settings() {
  const { settings, setSettings } = useOutletContext();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleChange = (field) => (event) => {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSettings({
      ...form,
      defaultMilkRate: Number(form.defaultMilkRate || 0),
    });
    setSaved(true);
  };

  return (
    <>
      <Box className="page-heading">
        <Box>
          <Typography component="h1">Settings</Typography>
          <Typography>Set the company profile and default milk rate used in new collection entries.</Typography>
        </Box>
      </Box>

      <Paper className="soft-card settings-panel">
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            {saved && <Alert severity="success">Settings saved successfully.</Alert>}
            <TextField
              label="Company Name"
              value={form.companyName}
              onChange={handleChange("companyName")}
              required
            />
            <TextField
              label="Company Address"
              value={form.companyAddress}
              onChange={handleChange("companyAddress")}
              multiline
              minRows={3}
              required
            />
            <TextField
              label="Default Milk Rate"
              type="number"
              value={form.defaultMilkRate}
              onChange={handleChange("defaultMilkRate")}
              inputProps={{ min: 0, step: "0.01" }}
              required
            />
            <Box>
              <Button type="submit" variant="contained" startIcon={<MdSave />}>
                Save Settings
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </>
  );
}
