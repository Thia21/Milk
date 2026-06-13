import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CssBaseline,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { MdLock, MdLocalDrink, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useAuth } from "../hooks/useAuth.js";
import { theme } from "../theme.js";

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = login(email, password);
    setLoading(false);
    if (result.ok) {
      navigate("/dashboard", { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: 4,
          background:
            "linear-gradient(135deg, #EEF2FF 0%, #F0F4FF 50%, #EDE9FE 100%)",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          {/* Logo */}
          <Stack alignItems="center" sx={{ mb: 4 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "20px",
                background: "linear-gradient(135deg, #4361EE, #818CF8)",
                boxShadow: "0 12px 32px rgba(67, 97, 238, 0.35)",
                display: "grid",
                placeItems: "center",
                mb: 2,
              }}
            >
              <MdLocalDrink size={36} color="#fff" />
            </Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "#1A2B5E", textAlign: "center" }}
            >
              Sekar Milk
            </Typography>
            <Typography sx={{ color: "#6B7A99", fontSize: "0.88rem", textAlign: "center" }}>
              Management System
            </Typography>
          </Stack>

          {/* Card */}
          <Paper
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: "20px",
              border: "1px solid #E2E8F7",
              boxShadow: "0 8px 40px rgba(67, 97, 238, 0.1)",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#1A2B5E", mb: 0.5 }}
            >
              Sign in
            </Typography>
            <Typography sx={{ color: "#6B7A99", fontSize: "0.85rem", mb: 3 }}>
              Use your admin credentials to continue
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: "10px" }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                  fullWidth
                />
                <TextField
                  label="Password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPw((v) => !v)}
                          edge="end"
                          aria-label="Toggle password visibility"
                        >
                          {showPw ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  startIcon={<MdLock size={18} />}
                  sx={{
                    py: 1.5,
                    borderRadius: "12px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    mt: 0.5,
                  }}
                >
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </Stack>
            </Box>
          </Paper>

          <Typography
            sx={{ textAlign: "center", color: "#94A3B8", fontSize: "0.78rem", mt: 3 }}
          >
            Sekar Milk · Offline-ready · Local data
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
