import React from "react";
import { Box, Typography, alpha, useTheme } from "@mui/material";
import logo from "../assets/earist-logo.png";

const AppHeader = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        textAlign: "center",
        mb: { xs: 3, md: 5 },
        pt: { xs: 3, md: 4 },
      }}
    >
      <img
        src={logo}
        alt="EARIST Logo"
        style={{
          height: 80,
          borderRadius: "50%",
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`,
          marginBottom: 26,
        }}
      />
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        EARIST Health Access Hub
      </Typography>
    </Box>
  );
};

export default AppHeader;
