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
  MdCalendarToday,
  MdClose,
  MdDashboard,
  MdLocalDrink,
  MdLocalShipping,
  MdPayments,
  MdPeopleAlt,
  MdReceiptLong,
  MdSettings,
  MdStorefront,
} from "react-icons/md";

const collectionNav = [
  { label: "Dashboard",          path: "/dashboard",    icon: MdDashboard   },
  { label: "Collection Centers", path: "/centers",      icon: MdStorefront  },
  { label: "Milk Entries",       path: "/milk-entries", icon: MdLocalDrink  },
  { label: "Payments",           path: "/payments",     icon: MdPayments    },
  { label: "Reports",            path: "/reports",      icon: MdAssessment  },
  { label: "Settings",           path: "/settings",     icon: MdSettings    },
];

const deliveryNav = [
  { label: "Delivery Overview",  path: "/delivery/dashboard",     icon: MdLocalShipping },
  { label: "Customers",          path: "/delivery/customers",     icon: MdPeopleAlt     },
  { label: "Daily Deliveries",   path: "/delivery/entries",       icon: MdCalendarToday },
  { label: "Subscriptions",      path: "/delivery/subscriptions", icon: MdReceiptLong   },
  { label: "Delivery Reports",   path: "/delivery/reports",       icon: MdAssessment    },
];

function NavItem({ item, collapsed, isMobile, onClose }) {
  const Icon = item.icon;
  const button = (
    <ListItemButton
      component={NavLink}
      to={item.path}
      onClick={isMobile ? onClose : undefined}
      className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
      sx={{
        minHeight: 44,
        justifyContent: collapsed ? "center" : "flex-start",
        px: collapsed ? 1.25 : 1.75,
      }}
    >
      <ListItemIcon
        sx={{ minWidth: collapsed ? 0 : 36, justifyContent: "center", color: "inherit" }}
      >
        <Icon size={21} />
      </ListItemIcon>
      {!collapsed && <ListItemText primary={item.label} />}
    </ListItemButton>
  );

  return (
    <Box sx={{ mb: 0.5 }}>
      {collapsed ? (
        <Tooltip title={item.label} placement="right">
          {button}
        </Tooltip>
      ) : (
        button
      )}
    </Box>
  );
}

function SectionLabel({ label, collapsed }) {
  if (collapsed) {
    return <Divider sx={{ my: 1.25, borderColor: "#e5effb" }} />;
  }
  return (
    <Typography
      sx={{
        px: 1.75,
        pt: 1.5,
        pb: 0.75,
        fontSize: "0.68rem",
        fontWeight: 800,
        letterSpacing: "0.08em",
        color: "#9caec4",
        textTransform: "uppercase",
      }}
    >
      {label}
    </Typography>
  );
}

function SidebarContent({ collapsed, isMobile, onClose }) {
  return (
    <Box className="sidebar-content">
      {/* Brand */}
      <Box className="sidebar-brand">
        <Box className="brand-mark">SM</Box>
        {!collapsed && (
          <Box>
            <Typography className="brand-title">Sekar Milk</Typography>
            <Typography className="brand-subtitle">Management System</Typography>
          </Box>
        )}
        {isMobile && (
          <IconButton aria-label="Close sidebar" onClick={onClose} sx={{ ml: "auto" }}>
            <MdClose size={22} />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ my: 2, borderColor: "#e5effb" }} />

      {/* Collection section */}
      <List className="sidebar-nav" disablePadding>
        <SectionLabel label="Collection" collapsed={collapsed} />
        {collectionNav.map((item) => (
          <NavItem key={item.path} item={item} collapsed={collapsed} isMobile={isMobile} onClose={onClose} />
        ))}
      </List>

      {/* Delivery section */}
      <List className="sidebar-nav" disablePadding sx={{ mt: 1 }}>
        <SectionLabel label="Delivery" collapsed={collapsed} />
        {deliveryNav.map((item) => (
          <NavItem key={item.path} item={item} collapsed={collapsed} isMobile={isMobile} onClose={onClose} />
        ))}
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
        "& .MuiDrawer-paper": { boxSizing: "border-box" },
      }}
    >
      <SidebarContent collapsed={isMobile ? false : collapsed} isMobile={isMobile} onClose={onClose} />
    </Drawer>
  );
}
