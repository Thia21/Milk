import { NavLink } from "react-router-dom";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  MdAssessment,
  MdClose,
  MdDashboard,
  MdLocalDrink,
  MdPayments,
  MdSettings,
  MdStorefront,
} from "react-icons/md";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: MdDashboard },
  { label: "Collection Centers", path: "/centers", icon: MdStorefront },
  { label: "Milk Entries", path: "/milk-entries", icon: MdLocalDrink },
  { label: "Payments", path: "/payments", icon: MdPayments },
  { label: "Reports", path: "/reports", icon: MdAssessment },
  { label: "Settings", path: "/settings", icon: MdSettings },
];

function SidebarContent({ collapsed, isMobile, onClose }) {
  return (
    <Box className="sidebar-content">
      <Box className="sidebar-brand">
        <Box className="brand-mark">SM</Box>
        {!collapsed && (
          <Box>
            <Typography className="brand-title">Sekar Milk</Typography>
            <Typography className="brand-subtitle">Collection System</Typography>
          </Box>
        )}
        {isMobile && (
          <IconButton aria-label="Close sidebar" onClick={onClose} sx={{ ml: "auto" }}>
            <MdClose size={22} />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ my: 2, borderColor: "#e5effb" }} />

      <List className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const button = (
            <ListItemButton
              component={NavLink}
              to={item.path}
              onClick={isMobile ? onClose : undefined}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              sx={{
                minHeight: 46,
                justifyContent: collapsed ? "center" : "flex-start",
                px: collapsed ? 1.25 : 1.75,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 38,
                  justifyContent: "center",
                  color: "inherit",
                }}
              >
                <Icon size={22} />
              </ListItemIcon>
              {!collapsed && <ListItemText primary={item.label} />}
            </ListItemButton>
          );

          return (
            <Box key={item.path} sx={{ mb: 0.5 }}>
              {collapsed ? (
                <Tooltip title={item.label} placement="right">
                  {button}
                </Tooltip>
              ) : (
                button
              )}
            </Box>
          );
        })}
      </List>

      {!collapsed && (
        <Box className="sidebar-footer">
          <Typography variant="caption">Local workspace</Typography>
          <Typography variant="body2">Offline-ready records</Typography>
        </Box>
      )}
    </Box>
  );
}

export default function Sidebar({ collapsed, isMobile, open, width, onClose }) {
  const drawerWidth = isMobile ? 280 : width;

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? open : true}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          width: drawerWidth,
          overflowX: "hidden",
          borderRight: "1px solid #e4edf7",
          bgcolor: "#ffffff",
          transition: "width 220ms ease",
        },
      }}
      sx={{
        width: { md: drawerWidth },
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          boxSizing: "border-box",
        },
      }}
    >
      <SidebarContent collapsed={isMobile ? false : collapsed} isMobile={isMobile} onClose={onClose} />
    </Drawer>
  );
}
