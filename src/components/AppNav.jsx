import { Box, Chip, Stack, Typography } from "@mui/material";
import { MdDashboard, MdLocalDrink, MdLocalShipping } from "react-icons/md";

const APPS = [
  {
    key: "main",
    label: "Dashboard",
    href: "/",
    icon: MdDashboard,
    color: "#2D46C4",
    bg: "#EEF2FF",
    border: "#BFD0F7",
  },
  {
    key: "collection",
    label: "Collection",
    href: "/collection-entry.html",
    icon: MdLocalDrink,
    color: "#b45309",
    bg: "#fff8e1",
    border: "#fde68a",
  },
  {
    key: "delivery",
    label: "Delivery",
    href: "/delivery-entry.html",
    icon: MdLocalShipping,
    color: "#5b21b6",
    bg: "#ede9fe",
    border: "#c4b5fd",
  },
];

export default function AppNav({ current }) {
  return (
    <Box
      component="header"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        bgcolor: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid #E2E8F7",
        boxShadow: "0 1px 8px rgba(67,97,238,0.08)",
        height: { xs: 56, sm: 60 },
        display: "flex",
        alignItems: "center",
        px: { xs: 1.5, sm: 3 },
        gap: { xs: 1, sm: 2 },
      }}
    >
      {/* Brand */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            width: { xs: 30, sm: 34 },
            height: { xs: 30, sm: 34 },
            borderRadius: "9px",
            background: "linear-gradient(135deg, #4361EE, #818CF8)",
            boxShadow: "0 4px 12px rgba(67,97,238,0.28)",
            flexShrink: 0,
          }}
        >
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.7rem", lineHeight: 1 }}>
            SM
          </Typography>
        </Box>
        <Typography
          sx={{
            display: { xs: "none", sm: "block" },
            fontWeight: 700,
            fontSize: "0.92rem",
            color: "#1A2B5E",
            whiteSpace: "nowrap",
          }}
        >
          Sekar Milk
        </Typography>
      </Stack>

      {/* Divider */}
      <Box sx={{ width: "1px", height: 24, bgcolor: "#E2E8F7", flexShrink: 0 }} />

      {/* App switcher — horizontally scrollable, no wrap */}
      <Box
        className="scroll-x-hidden"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          overflowX: "auto",
          minWidth: 0,
        }}
      >
        {APPS.map((app) => {
          const Icon = app.icon;
          const isActive = app.key === current;
          return (
            <Chip
              key={app.key}
              component="a"
              href={app.href}
              icon={
                <Icon
                  size={13}
                  color={isActive ? app.color : "#94A3B8"}
                  style={{ marginLeft: 6 }}
                />
              }
              label={app.label}
              clickable
              sx={{
                flexShrink: 0,
                fontWeight: 600,
                fontSize: { xs: "0.74rem", sm: "0.8rem" },
                height: { xs: 28, sm: 32 },
                cursor: "pointer",
                textDecoration: "none",
                bgcolor: isActive ? app.bg : "transparent",
                color: isActive ? app.color : "#6B7A99",
                border: `1px solid ${isActive ? app.border : "#E2E8F7"}`,
                "&:hover": { bgcolor: app.bg, borderColor: app.border, color: app.color },
                transition: "all 140ms ease",
              }}
            />
          );
        })}
      </Box>

      {/* Live sync dot — hidden on mobile */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          gap: 0.5,
          flexShrink: 0,
          px: 1,
          py: 0.5,
          borderRadius: "20px",
          bgcolor: "#EEF2FF",
          border: "1px solid #BFD0F7",
        }}
      >
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            bgcolor: "#22C55E",
            animation: "pulse 2s infinite",
          }}
        />
        <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: "#2D46C4" }}>
          Live Sync
        </Typography>
      </Box>
    </Box>
  );
}
