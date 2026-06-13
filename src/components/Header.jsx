import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdLogout, MdMenu, MdNotificationsNone, MdSearch } from "react-icons/md";
import { useAuth } from "../hooks/useAuth.js";
import { formatDate } from "../utils/formatters.js";
import { toInputDate } from "../utils/dateUtils.js";

const titles = {
  "/dashboard":              "Collection Dashboard",
  "/centers":                "Collection Centers",
  "/milk-entries":           "Daily Milk Collection",
  "/payments":               "Payments",
  "/reports":                "Reports",
  "/settings":               "Settings",
  "/delivery/dashboard":     "Delivery Overview",
  "/delivery/customers":     "Delivery Customers",
  "/delivery/entries":       "Daily Delivery Log",
  "/delivery/subscriptions": "Subscription Payments",
  "/delivery/reports":       "Delivery Reports",
};

export default function Header({ companyName, onSidebarToggle, sidebarWidth }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const { logout } = useAuth();
  const pageTitle = titles[location.pathname] || "Dashboard";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const currentDate = useMemo(() => formatDate(toInputDate()), []);

  return (
    <AppBar
      elevation={0}
      color="inherit"
      className="topbar no-print"
      sx={{
        borderBottom: "1px solid #D4EDD4",
        bgcolor: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(16px)",
        ml: { md: `${sidebarWidth}px` },
        width: { xs: "100%", md: `calc(100% - ${sidebarWidth}px)` },
        transition: "margin-left 220ms ease, width 220ms ease",
      }}
    >
      <Toolbar className="topbar-toolbar">
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
          <Tooltip title="Toggle sidebar">
            <IconButton edge="start" color="primary" aria-label="Toggle sidebar" onClick={onSidebarToggle}>
              <MdMenu size={24} />
            </IconButton>
          </Tooltip>
          <Box sx={{ minWidth: 0 }}>
            <Typography className="topbar-title">{pageTitle}</Typography>
            <Typography className="topbar-company" noWrap>
              {companyName}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} className="topbar-actions">
          <Chip label={currentDate} className="date-chip" />
          <Tooltip title="Notifications">
            <IconButton aria-label="Notifications" className="topbar-icon" sx={{ display: { xs: "none", sm: "inline-flex" } }}>
              <MdNotificationsNone size={22} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sign out">
            <IconButton aria-label="Sign out" onClick={handleLogout} className="topbar-icon">
              <MdLogout size={20} />
            </IconButton>
          </Tooltip>
          <Avatar className="user-avatar">SM</Avatar>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
