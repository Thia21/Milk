import { useMemo } from "react";
import { useLocation } from "react-router-dom";
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
import { MdMenu, MdNotificationsNone, MdSearch } from "react-icons/md";
import { formatDate } from "../utils/formatters.js";
import { toInputDate } from "../utils/dateUtils.js";

const titles = {
  "/dashboard": "Dashboard",
  "/centers": "Collection Centers",
  "/milk-entries": "Daily Milk Collection",
  "/payments": "Payments",
  "/reports": "Reports",
  "/settings": "Settings",
};

export default function Header({ companyName, onSidebarToggle, sidebarWidth }) {
  const location = useLocation();
  const pageTitle = titles[location.pathname] || "Dashboard";

  const currentDate = useMemo(() => formatDate(toInputDate()), []);

  return (
    <AppBar
      elevation={0}
      color="inherit"
      className="topbar no-print"
      sx={{
        borderBottom: "1px solid #e4edf7",
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
          <Tooltip title="Search">
            <IconButton aria-label="Search" className="topbar-icon">
              <MdSearch size={22} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton aria-label="Notifications" className="topbar-icon">
              <MdNotificationsNone size={22} />
            </IconButton>
          </Tooltip>
          <Avatar className="user-avatar">SM</Avatar>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
