import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/earist-logo.png";
import cover from "../assets/cover.png";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Paper,
  TextField,
  IconButton,
  InputAdornment,
  Alert,
  Grid,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Login as LoginIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

const Login = () => {
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      const role = await login(email, password); // This will throw on error
      console.log("🔐 Login successful. Returned role:", role);

      const map = {
        admin: "/admin",
        faculty: "/faculty",
        student: "/student",
        non_academic: "/non-academic",
      };

      const redirectPath = map[role] || "/login";
      console.log("📍 Redirecting to:", redirectPath, "for role:", role);
      console.log("🗺️  Available routes in map:", Object.keys(map));

      navigate(redirectPath);
    } catch (err) {
      // Error already toasted in AuthContext
      setError(err.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <>
      {loading && <LoadingSpinner />}

      {/* Header matching Register.jsx */}
      <AppBar position="static" color="primary">
        <Toolbar sx={{ py: { xs: 0.5, sm: 1 }, px: { xs: 1, sm: 3 } }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="flex-start"
                sx={{
                  py: { xs: 0.5, sm: 1 },
                  px: { xs: 1, sm: 3 },
                }}
              >
                <img
                  src={logo}
                  alt="EARIST Logo"
                  style={{
                    height: isMobile ? 35 : 50,
                    marginRight: isMobile ? 8 : 16
                  }}
                />
                <Typography
                  variant={isMobile ? "subtitle1" : "h5"}
                  sx={{ fontWeight: "bold" }}
                >
                  {isMobile ? "EARIST Hub" : "EARIST Health Access Hub"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>

      {/* Full-screen Background with blurred cover image */}
      <Box sx={{
        position: "relative",
        height: { xs: "calc(100vh - 60px)", sm: "100vh" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {/* Background image layer (blurred, 50% opacity) */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            overflow: "hidden",
            backgroundImage: `url(${cover})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "blur(6px)",
            opacity: 0.5,
          }}
        />

        {/* Soft dark overlay for contrast */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background: `linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.45))`,
          }}
        />

        <Container
          maxWidth="sm"
          sx={{
            position: "relative",
            zIndex: 2,
            p: { xs: 1, sm: 2 }
          }}
        >
          {/* Login Card */}
          <Paper
            elevation={16}
            sx={{
              p: { xs: 2.5, sm: 4, md: 5 },
              borderRadius: { xs: 2, sm: 4 },
              maxWidth: { xs: '100%', sm: 440 },
              mx: "auto",
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(4px)",
              boxShadow: `0 20px 40px ${alpha(
                theme.palette.common.black,
                0.1
              )}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            }}
          >
            {/* Card Title */}
            <Box textAlign="center" mb={{ xs: 2.5, sm: 4 }}>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight="bold"
                gutterBottom
              >
                Sign In
              </Typography>
              <Typography
                variant={isMobile ? "caption" : "body2"}
                color="text.secondary"
              >
                Enter your credentials to continue
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: { xs: 2, sm: 3 },
                  borderRadius: 2,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}
              >
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                autoFocus={!isMobile}
                margin="normal"
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                margin="normal"
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                size={isMobile ? "medium" : "large"}
                startIcon={!isMobile && <LoginIcon />}
                sx={{
                  mt: { xs: 2, sm: 3 },
                  mb: { xs: 1.5, sm: 2 },
                  py: { xs: 1.2, sm: 1.5 },
                  borderRadius: 2,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: 2,
                  "&:hover": {
                    boxShadow: 4,
                  },
                }}
              >
                Sign In
              </Button>

              <Box textAlign="center" mt={{ xs: 1.5, sm: 2 }}>
                <Typography
                  variant={isMobile ? "caption" : "body2"}
                  color="text.secondary"
                >
                  Don't have an account?{" "}
                  <Button
                    onClick={() => navigate("/register")}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    Register here
                  </Button>
                </Typography>
              </Box>
            </Box>

            {/* Footer */}
            <Typography
              variant="caption"
              display="block"
              textAlign="center"
              mt={4}
              color="text.disabled"
            >
              © {new Date().getFullYear()} EARIST Clinic Health Access Hub. All rights
              reserved.
            </Typography>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default Login;
