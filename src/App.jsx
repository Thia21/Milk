import { useMemo, useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from "@mui/material";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CollectionCenters from "./pages/CollectionCenters.jsx";
import MilkEntries from "./pages/MilkEntries.jsx";
import Payments from "./pages/Payments.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";
import { useLocalStorage } from "./hooks/useLocalStorage.js";
import { initialCenters, initialEntries, initialPayments, initialSettings } from "./services/seedData.js";
import "./App.css";

const expandedWidth = 280;
const collapsedWidth = 88;

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1a73e8",
      light: "#e8f0fe",
      dark: "#1558b0",
    },
    secondary: {
      main: "#00a4e4",
    },
    success: {
      main: "#1e8e3e",
    },
    warning: {
      main: "#f9ab00",
    },
    error: {
      main: "#d93025",
    },
    background: {
      default: "#f8fbff",
      paper: "#ffffff",
    },
    text: {
      primary: "#1f2937",
      secondary: "#5f6b7a",
    },
    divider: "#e4edf7",
  },
  typography: {
    fontFamily: '"Google Sans", "Product Sans", Inter, Roboto, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: {
      fontWeight: 700,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: "#475569",
          fontWeight: 700,
          backgroundColor: "#f4f9ff",
        },
      },
    },
  },
});

function AppShell() {
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [centers, setCenters] = useLocalStorage("sekar-centers", initialCenters);
  const [entries, setEntries] = useLocalStorage("sekar-milk-entries", initialEntries);
  const [payments, setPayments] = useLocalStorage("sekar-payments", initialPayments);
  const [settings, setSettings] = useLocalStorage("sekar-settings", initialSettings);

  const sidebarWidth = isSidebarOpen ? expandedWidth : collapsedWidth;

  const appData = useMemo(
    () => ({
      centers,
      setCenters,
      entries,
      setEntries,
      payments,
      setPayments,
      settings,
      setSettings,
    }),
    [centers, entries, payments, settings, setCenters, setEntries, setPayments, setSettings]
  );

  const handleSidebarToggle = () => {
    setIsSidebarOpen((current) => !current);
  };

  return (
    <Box className="app-shell">
      <Sidebar
        collapsed={!isSidebarOpen}
        isMobile={isMobile}
        open={isSidebarOpen}
        width={sidebarWidth}
        onClose={() => setIsSidebarOpen(false)}
      />
      <Box
        className="app-main"
        sx={{
          ml: { md: `${sidebarWidth}px` },
          width: { md: `calc(100% - ${sidebarWidth}px)` },
        }}
      >
        <Header
          companyName={settings.companyName}
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={handleSidebarToggle}
          sidebarWidth={sidebarWidth}
        />
        <Box component="main" className="page-shell">
          <Outlet context={appData} />
        </Box>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/centers" element={<CollectionCenters />} />
          <Route path="/milk-entries" element={<MilkEntries />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}
