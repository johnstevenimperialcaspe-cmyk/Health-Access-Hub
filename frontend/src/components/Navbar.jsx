import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/earist-logo.png";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  useTheme,
  useMediaQuery 
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import MenuIcon from "@mui/icons-material/Menu";
import Modal from "./Modal";

const Navbar = ({ onMenuClick }) => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Format role for display
  const formatRole = (role) => {
    if (!role) return "";
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Open confirmation modal
  const confirmLogout = () => {
    setLogoutModalOpen(true);
  };

  // Confirmed logout
  const handleConfirmedLogout = () => {
    setLogoutModalOpen(false);
    logout(() => {
      navigate("/login", { replace: true });
      // Force page reload to wipe any stale client-side state
      window.location.reload();
    });
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            {/* Hamburger Menu for Mobile */}
            {currentUser && isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={onMenuClick}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <img
              src={logo}
              alt="EARIST Logo"
              style={{ height: isMobile ? 32 : 40, marginRight: isMobile ? 8 : 16 }}
            />
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"} 
              sx={{ 
                textTransform: "capitalize",
                display: { xs: 'none', sm: 'block' }
              }}
            >
              EARIST Health Access Hub
            </Typography>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                textTransform: "capitalize",
                display: { xs: 'block', sm: 'none' }
              }}
            >
              EARIST Hub
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={isMobile ? 0.5 : 2}>
            {currentUser ? (
              <>
                {/* User Info - Hide name on very small screens */}
                <Box
                  sx={{
                    mr: { xs: 0, sm: 1 },
                    textAlign: "right",
                    display: { xs: 'none', sm: 'flex' },
                    flexDirection: "column",
                    alignItems: "flex-end",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      textTransform: "capitalize",
                      fontWeight: "bold",
                      letterSpacing: 0.5,
                    }}
                  >
                    {currentUser.first_name} {currentUser.last_name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="inherit"
                    sx={{
                      opacity: 0.8,
                      display: "block",
                      lineHeight: 1,
                      fontWeight: 500,
                    }}
                  >
                    {formatRole(currentUser.role)}
                  </Typography>
                </Box>

                <Button
                  color="inherit"
                  onClick={confirmLogout}
                  startIcon={!isMobile && <LogoutIcon />}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    backgroundColor: "error.main",
                    textTransform: "none",
                    minWidth: isMobile ? 'auto' : undefined,
                    px: isMobile ? 1 : 2,
                    "&:hover": {
                      backgroundColor: "error.dark",
                      boxShadow: "0 4px 20px 0 rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  {isMobile ? <LogoutIcon fontSize="small" /> : "Logout"}
                </Button>
              </>
            ) : (
              <Button
                color="inherit"
                onClick={() => navigate("/login")}
                startIcon={<LoginIcon />}                size={isMobile ? "small" : "medium"}              >
                Login
              </Button>
            )}
          </Box>
        </Box>
      </Toolbar>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Confirm Logout"
      >
        <Typography variant="body1" sx={{ mb: 3 }}>
          Are you sure you want to logout?
        </Typography>
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" onClick={() => setLogoutModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmedLogout}
          >
            Logout
          </Button>
        </Box>
      </Modal>
    </AppBar>
  );
};

export default Navbar;
