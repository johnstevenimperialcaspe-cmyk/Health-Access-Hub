import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#6366f1", // Indigo
      light: "#818cf8",
      dark: "#4f46e5",
    },
    secondary: {
      main: "#a855f7", // Purple
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
        containedPrimary: {
          background: "linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)",
          "&:hover": {
            background: "1linear-gradient(45deg, #5855eb 30%, #7c4dff 90%)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        },
      },
    },
  },
});
