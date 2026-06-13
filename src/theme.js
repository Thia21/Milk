import { createTheme } from "@mui/material";

const FONT = '"Poppins", "Plus Jakarta Sans", "Google Sans", Inter, system-ui, sans-serif';

export const theme = createTheme({
  palette: {
    mode: "light",
    primary:    { main: "#4361EE", light: "#EEF2FF", dark: "#2D46C4" },
    secondary:  { main: "#F97316" },
    success:    { main: "#22C55E" },
    warning:    { main: "#F59E0B" },
    error:      { main: "#EF4444" },
    background: { default: "#F0F4FF", paper: "#ffffff" },
    text:       { primary: "#1A2B5E", secondary: "#6B7A99" },
    divider:    "#E2E8F7",
  },
  typography: {
    fontFamily: FONT,
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, boxShadow: "none" },
        contained: {
          boxShadow: "0 2px 10px rgba(67, 97, 238, 0.25)",
          "&:hover": { boxShadow: "0 4px 16px rgba(67, 97, 238, 0.35)" },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
        elevation1: { boxShadow: "0 2px 12px rgba(67, 97, 238, 0.08)" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: "0 2px 12px rgba(67, 97, 238, 0.08)" },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: "#2D46C4",
          fontWeight: 600,
          backgroundColor: "#EEF2FF",
          fontFamily: FONT,
        },
        root: { fontFamily: FONT },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 16 } },
    },
    MuiChip: {
      styleOverrides: { label: { fontFamily: FONT, fontWeight: 600 } },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": { fontFamily: FONT, borderRadius: 10 },
          "& .MuiInputLabel-root": { fontFamily: FONT },
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "#E2E8F7" },
            "&:hover fieldset": { borderColor: "#BFD0F7" },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: "1px solid #E2E8F7" },
      },
    },
  },
});
