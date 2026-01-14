import React from "react";
import { Box, Container, alpha, useTheme } from "@mui/material";
import AppHeader from "./AppHeader";

const AppLayout = ({ children }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg,
          ${alpha(theme.palette.primary.main, 0.1)} 0%,
          ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <AppHeader />
        {children}
      </Container>
    </Box>
  );
};

export default AppLayout;
