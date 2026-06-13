import { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Box, CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material";
import { useAuth } from "./hooks/useAuth.js";
import { useCollection } from "./hooks/useCollection.js";
import { useDocument } from "./hooks/useDocument.js";
import Login from "./pages/Login.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import AppNav from "./components/AppNav.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CollectionCenters from "./pages/CollectionCenters.jsx";
import MilkEntries from "./pages/MilkEntries.jsx";
import Payments from "./pages/Payments.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard.jsx";
import DeliveryCustomers from "./pages/delivery/DeliveryCustomers.jsx";
import DeliveryEntries from "./pages/delivery/DeliveryEntries.jsx";
import DeliverySubscriptions from "./pages/delivery/DeliverySubscriptions.jsx";
import DeliveryReports from "./pages/delivery/DeliveryReports.jsx";
import { initialSettings } from "./services/seedData.js";
import { theme } from "./theme.js";
import "./App.css";

const expandedWidth = 284;
const collapsedWidth = 88;

function AppShell() {
  const { isLoggedIn } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [isMobile]);

  const [centers,               setCenters]               = useCollection("centers");
  const [entries,               setEntries]               = useCollection("milkEntries");
  const [payments,              setPayments]              = useCollection("payments");
  const [deliveryCustomers,     setDeliveryCustomers]     = useCollection("deliveryCustomers");
  const [deliveryEntries,       setDeliveryEntries]       = useCollection("deliveryEntries");
  const [deliverySubscriptions, setDeliverySubscriptions] = useCollection("subscriptions");
  const [settings,              setSettings]              = useDocument("appSettings", "main", initialSettings);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  const sidebarWidth = isSidebarOpen && !isMobile ? expandedWidth : collapsedWidth;

  const appData = useMemo(
    () => ({
      centers, setCenters,
      entries, setEntries,
      payments, setPayments,
      settings, setSettings,
      deliveryCustomers, setDeliveryCustomers,
      deliveryEntries, setDeliveryEntries,
      deliverySubscriptions, setDeliverySubscriptions,
    }),
    [
      centers, entries, payments, settings,
      deliveryCustomers, deliveryEntries, deliverySubscriptions,
      setCenters, setEntries, setPayments, setSettings,
      setDeliveryCustomers, setDeliveryEntries, setDeliverySubscriptions,
    ]
  );

  return (
    <Box className="app-shell">
      <AppNav current="main" />
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
          onSidebarToggle={() => setIsSidebarOpen((v) => !v)}
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
        <Route path="/login" element={<Login />} />
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/centers"      element={<CollectionCenters />} />
          <Route path="/milk-entries" element={<MilkEntries />} />
          <Route path="/payments"     element={<Payments />} />
          <Route path="/reports"      element={<Reports />} />
          <Route path="/settings"     element={<Settings />} />
          <Route path="/delivery"     element={<Navigate to="/delivery/dashboard" replace />} />
          <Route path="/delivery/dashboard"     element={<DeliveryDashboard />} />
          <Route path="/delivery/customers"     element={<DeliveryCustomers />} />
          <Route path="/delivery/entries"       element={<DeliveryEntries />} />
          <Route path="/delivery/subscriptions" element={<DeliverySubscriptions />} />
          <Route path="/delivery/reports"       element={<DeliveryReports />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}
